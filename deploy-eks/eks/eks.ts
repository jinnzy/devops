import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import {
  desiredClusterSize,
  eksName,
  eksNodeInstanceType,
  maxClusterSize,
  minClusterSize,
  networkReference
} from "./config";


const getEksCluster = async () => {

  const vpcId = networkReference.getOutput("vpcId");
  const publicSubnetIds = (await networkReference.getOutputDetails("publicSubnetIds")).value;
  const privateSubnetIds = (await networkReference.getOutputDetails("privateSubnetIds")).value;

  console.log(eksName)
// Create the EKS cluster
  return new eks.Cluster(eksName, {
    // version: "1.27",
    // Put the cluster in the new VPC created earlier
    vpcId: vpcId,
    // Public subnets will be used for load balancers
    publicSubnetIds: publicSubnetIds,
    // Private subnets will be used for cluster nodes
    privateSubnetIds: privateSubnetIds,
    // Change configuration values to change any of the following settings
    // instanceType: eksNodeInstanceType,
    // desiredCapacity: desiredClusterSize,
    minSize: minClusterSize,
    maxSize: maxClusterSize,
    desiredCapacity: desiredClusterSize,
    nodePublicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDCyEG2ktJaqxxAd8uwTHydRXeq1tp5fzUkjkmpEMCl2ZCgIgaExxWX/jhRdcIAi3nkHgWkeTgBZ9Hg4uP0IWuRbUA360OEsp8iSThV/Gkjs8rObDSoiReNlOIKSJ4+cApJ+Wx+KZfGbSQ/DvAaJwaTDijTu48b+fr5EvpUSBD1NyrCCTO8ofeAnsLEy3prkg4/lC94YqwAGSrZ5FLMaqF5vT06pxdqDPQk2aL4+WLpP3rAkgOdsOl2Fjw+RVHaRQzOeurwQazYAFhqPgEETdVLvdq7/bqPm54QjnRSOCNXTn05aM+tphHA0rs/QBn8hgSNeyV41KkOasEX3hLUBq5wW3nki79zPgsOQzDQztVyeHm559OvNkmhFqS++BwuPn4B24rS/EnhCGIHq2W8yq5fg8kv+Dbl2JahMBdrEW08CwHYPbQamRrcG5IjPPl4aaA9ttptRP3yBTuhKauE8nqM0RhpEwNGY5lPfP7AQFX7SQRrUAI7++IacLgM9i8FODc=",
    nodeAssociatePublicIpAddress: false,
    nodeRootVolumeSize: 50,
    instanceType: eksNodeInstanceType,
    createOidcProvider: true,
  })

}

export const eksCluster = getEksCluster()
export async function getProvider() {

// Export some values for use elsewhere
  const kubeconfig = (await eksCluster).kubeconfig;

  return new k8s.Provider("provider", { kubeconfig: kubeconfig });
}