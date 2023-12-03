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
        nodePublicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDCyEG2ktJaqxxAd8uwTHydRXeq1tp5fzUkjkmpEMCl2ZCgIgaExxWX/jhRdcIAi3nkHgWkeTgBZ9Hg4uP0IWuRbUA360OEsp8iSThV/Gkjs8rObDSoiReNlOIKSJ4+cApJ+Wx+KZfGbSQ/DvAaJwaTDijTu48b+fr5EvpUSBD1NyrCCTO8ofeAnsLEy3prkg4/lC94YqwAGSrZ5FLMaqF5vT06pxdqDPQk2aL4+WLpP3rAkgOdsOl2Fjw+RVHaRQzOeurwQazYAFhqPgEETdVLvdq7/bqPm54QjnRSOCNXTn05aM+tphHA0rs/QBn8hgSNeyV41KkOasEX3hLUBq5wW3nki79zPgsOQzDQztVyeHm559OvNkmhFqS++BwuPn4B24rS/EnhCGIHq2W8yq5fg8kv+Dbl2JahMBdrEW08CwHYPbQamRrcG5IjPPl4aaA9ttptRP3yBTuhKauE8nqM0RhpEwNGY5lPfP7AQFX7SQRrUAI7++IacLgM9i8FODc="
    })

}
