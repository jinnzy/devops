import * as eks from "@pulumi/eks";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import {Vpc} from "@pulumi/awsx/ec2";
import {awsLoadBalance} from "./awsLoadBalance";
import {nodeGroup} from "./nodeGroup";


(async ()=> {
    await nodeGroup()
    await awsLoadBalance()
})()