import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPIFY_SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  restResources,
  isEmbeddedApp: true,
  sessionStorage: {
    storeSession: async (session) => {
      await prisma.session.upsert({
        where: { id: session.id },
        update: { ...session },
        create: { ...session },
      });
      return true;
    },
    loadSession: async (id) => {
      const session = await prisma.session.findUnique({ where: { id } });
      return session ? { ...session, id: session.id } : undefined;
    },
    deleteSession: async (id) => {
      await prisma.session.delete({ where: { id } });
      return true;
    },
  },
  billing: {
    "Starter Plan": {
      amount: 9.99,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
    },
    "Pro Plan": {
      amount: 19.99,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
    },
  },
});

export default shopify;
export const authenticate = shopify.authenticate;
    
