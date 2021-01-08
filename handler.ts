import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import * as Pusher from "pusher";

const fetch = require("node-fetch");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "eu",
  useTLS: true,
});

export const webhook: APIGatewayProxyHandler = async (event, _context) => {
  const body = JSON.parse(event.body);

  let response: {
    statusCode: number;
    body: string;
  };

  if (body) {
    if ("challenge" in body) {
      response = {
        statusCode: 200,
        body: body.challenge,
      };
      await pusher.trigger(
        `twitchEventSub_${body.subscription.condition.broadcaster_user_id}`,
        "subscriptionAdded",
        body.subscription
      );
    } else if ("event" in body) {
      response = {
        statusCode: 200,
        body: body.event,
      };
      await pusher.trigger(
        `twitchEventSub_${body.event.broadcaster_user_id}`,
        "rewardClaimed",
        body.event
      );
    } else
      response = {
        statusCode: 418,
        body: JSON.stringify({
          code: 418,
          message: `I'm a teapot`,
        }),
      };
    return response;
  }
};

export const login: APIGatewayProxyHandler = async (event, _context) => {
  const queryParameters = event.queryStringParameters;
  const code = queryParameters.code || false;

  if (code) {
    const data = {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: `https://${process.env.ENDPOINT_HOST}/login`,
    };
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    await pusher.trigger(`userAuth`, "tokenLogin", json);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
    body: `<script>window.close()</script>`,
  };
};

export const fallback: APIGatewayProxyHandler = async (_event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      code: 200,
      message: "online",
    }),
  };
};
