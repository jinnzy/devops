import * as eks from "@pulumi/eks";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import {desiredClusterSize, eksName, eksNodeInstanceType, maxClusterSize, minClusterSize} from "./config";
import {eksCluster} from "./eks";



export async function nodeGroup() {
    const node = new eks.NodeGroupV2(`${eksName}-node01`, {
        // amiId: 'ami-06bf8e441ff8de6c6',
        cluster: (await eksCluster),
        // instanceProfile: eksCluster.instanceRoles.apply(roles => roles[0].name),
        instanceType: eksNodeInstanceType,
        desiredCapacity: desiredClusterSize,
        maxSize: maxClusterSize,
        minSize: minClusterSize,
        nodeAssociatePublicIpAddress: false,
        nodeRootVolumeSize: 50,
        nodeRootVolumeType: 'gp3',
        // nodeSubnetIds: eksVpc.vpcId.apply(async vpcId => (await aws.ec2.getSubnetIds({vpcId})).ids),
        nodePublicKey: "ssh-rsa "
    })

}
