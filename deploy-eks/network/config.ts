import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
export const vpcNetworkCidr = config.get("vpcNetworkCidr") || "10.0.0.0/16";

