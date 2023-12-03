import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const minClusterSize = config.getNumber("minClusterSize") || 1;
export const maxClusterSize = config.getNumber("maxClusterSize") || 2;
export const desiredClusterSize = config.getNumber("desiredClusterSize") || 1;
export const eksNodeInstanceType = config.get("eksNodeInstanceType") || "t3.medium";
export const eksName = config.get("eksName") || "eks";

export const stackName = pulumi.getStack();

export const networkReference = new pulumi.StackReference(`jinnzy/network/${stackName}`);
