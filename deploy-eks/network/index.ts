import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import {vpcNetworkCidr} from "./config";
import {ec2} from "@pulumi/awsx/types/input";
import NatGatewayConfigurationArgs = ec2.NatGatewayConfigurationArgs;
import {InternetGatewayArgs} from "@pulumi/aws/ec2";

const stackName = pulumi.getStack();

const vpcName = `${stackName}-vpc`

const tags = { "project": "subnets", "owner": "pulumi"};
let natGateways: NatGatewayConfigurationArgs = {
  strategy: awsx.ec2.NatGatewayStrategy.Single
}

let internetGateway: InternetGatewayArgs = {

}

if (stackName == "prod"){
  // 上线后修改为每个az一个
  // natGateways.strategy = awsx.ec2.NatGatewayStrategy.OnePerAz
  natGateways.strategy = awsx.ec2.NatGatewayStrategy.Single
}


// Create a VPC for your cluster
const vpc = new awsx.ec2.Vpc(vpcName, {
    enableDnsHostnames: true,
    cidrBlock: vpcNetworkCidr,
    // 可用区
    // numberOfAvailabilityZones: 3,
    natGateways,
    subnetSpecs: [
      {type: "Public", tags: {"kubernetes.io/role/elb": "1", ...tags}},
      {type: "Private", tags: {"kubernetes.io/role/internal-elb": "1", ...tags}},
    ],
  },
  {        transformations: [(args: any) => {
      if (args.type === "aws:ec2/vpc:Vpc" || args.type === "aws:ec2/subnet:Subnet") {
        return {
          props: args.props,
          opts: pulumi.mergeOptions(args.opts, { ignoreChanges: ["tags"] }),
        };
      }
      return undefined;
    }]}
);

// Export the VPC's ID so it can be used by other programs
export const vpcId = vpc.vpcId;
export const privateSubnetIds = vpc.privateSubnetIds;
export const publicSubnetIds = vpc.publicSubnetIds;
