import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import {eksCluster, getProvider} from "./eks";



// This transformation is needed to remove the status field from the CRD
// otherwise the Chart fails to deploy
function removeStatus(obj: any, opts: pulumi.CustomResourceOptions) {
    if (obj.kind === "CustomResourceDefinition") {
        delete obj.status;
    }
}

export async function awsLoadBalance() {
    const provider = await getProvider()
    const aws_lb_ns = "aws-lb-controller";
    const service_account_name = `system:serviceaccount:${aws_lb_ns}:aws-lb-controller-serviceaccount`;
    const oidcArn = (await eksCluster).core.oidcProvider!.arn;
    const oidcUrl = (await eksCluster).core.oidcProvider!.url;
    // Create IAM role for AWS LB controller service account

    const iamRole = new aws.iam.Role("aws-loadbalancer-controller-role", {
        assumeRolePolicy: pulumi.all([oidcArn, oidcUrl]).apply(([oidcArn, oidcUrl]) =>
          JSON.stringify({
              Version: "2012-10-17",
              Statement: [
                  {
                      Effect: "Allow",
                      Principal: {
                          Federated: oidcArn,
                      },
                      Action: "sts:AssumeRoleWithWebIdentity",
                      Condition: {
                          StringEquals: { [`${oidcUrl}:sub`]: service_account_name },
                      },
                  },
              ],
          })
        ),
    });

    const policyDoc = JSON.stringify(require("./iam/iamPolicy.json"));

    const iamPolicy = new aws.iam.Policy("aws-loadbalancer-controller-policy", {
        policy: policyDoc,
    }, { parent: iamRole });

    new aws.iam.PolicyAttachment("aws-loadbalancer-controller-attachment", {
        policyArn: iamPolicy.arn,
        roles: [iamRole.name],
    }, { parent: iamRole });


    const namespace = new k8s.core.v1.Namespace(`${aws_lb_ns}-ns`, {
        metadata: {
            name: aws_lb_ns,
            labels: {
                "app.kubernetes.io/name": "aws-load-balancer-controller",
            },
        },
    }, { provider, parent: provider });

    const serviceAccount = new k8s.core.v1.ServiceAccount("aws-lb-controller-sa", {
        metadata: {
            name: "aws-lb-controller-serviceaccount",
            namespace: namespace.metadata.name,
            annotations: {
                "eks.amazonaws.com/role-arn": iamRole.arn,
            },
        },
    }, { provider, parent: namespace });




    new k8s.helm.v3.Chart("lb", {
        chart: "aws-load-balancer-controller",
        // version: "v2.5.4",
        fetchOpts: {
            repo: "https://aws.github.io/eks-charts",
        },
        namespace: namespace.metadata.name,
        values: {
            region: "ca-central-1",
            serviceAccount: {
                name: "aws-lb-controller-serviceaccount",
                create: false,
            },
            // vpcId: eksCluster.eksCluster.vpcConfig.vpcId,
            clusterName: (await eksCluster).eksCluster.name,
            podLabels: {
                stack: pulumi.getStack(),
                app: "aws-lb-controller",
            },
        },
        transformations: [removeStatus],
    }, { provider, parent: namespace });

}