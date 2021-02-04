import type { AWS } from "@serverless/typescript";
import * as dotenv from "dotenv";

dotenv.config();

const serverlessConfiguration: AWS = {
  service: process.env.APP_NAME,
  useDotenv: true,
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
    customDomain: {
      domainName: process.env.ENDPOINT_HOST,
      basePath: "",
    },
  },
  plugins: [
    "serverless-webpack",
    "serverless-domain-manager",
    "serverless-dotenv-plugin",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    memorySize: 512,
    stage: "production",
    region: "eu-west-1",
    lambdaHashingVersion: "20201221",
    apiGateway: {
      minimumCompressionSize: 512,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
  },
  functions: {
    webhook: {
      handler: "handler.webhook",
      events: [
        {
          http: {
            method: "post",
            path: "webhook",
          },
        },
      ],
    },
    login: {
      handler: "handler.login",
      events: [
        {
          http: {
            method: "get",
            path: "login",
          },
        },
      ],
    },
    fallback: {
      handler: "handler.fallback",
      events: [
        {
          http: {
            method: "get",
            path: "",
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
