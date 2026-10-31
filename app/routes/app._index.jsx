import { useState } from "react";
import { Page, Layout, Card, Button, FormLayout, TextField, Text, BlockStack, Badge, Box } from "@shopify/polaris";
import { useSubmit, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { billing, session } = await authenticate.admin(request);
  
  const billingCheck = await billing.check({
    plans: ["Starter Plan", "Pro Plan"],
    isTest: true,
  });

  return json({ 
    shop: session.shop, 
    hasPaidPlan: billingCheck.hasActivePayment 
  });
}

export async function action({ request }) {
  await authenticate.admin(request);
  const formData = await request.formData();
  const productName = formData.get("productName");

  const generatedCopy = `🔥 VENCEDOR E EXCLUSIVO: ${productName.toUpperCase()}! 🔥\n\nCansado de soluções que não funcionam? O ${productName} foi feito para quem busca resultados reais e duradouros na rotina.\n\n⭐ Desconto de lançamento ativo hoje!\n🚚 Frete Grátis disponível.\n\n👉 Toque em SAIBA MAIS para garantir o seu antes que o stock esgote no nosso site!`;

  return json({ generatedCopy });
}

export default function Index() {
  const { shop, hasPaidPlan } = useLoaderData();
  const [productName, setProductName] = useState("");
  const submit = useSubmit();

  const handleGenerate = () => {
    if (!productName) return;
    submit({ productName }, { method: "POST" });
  };

  return (
    <Page title="AdGenius AI Panel">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Box display="flex" justifyContent="space-between">
                <Text as="h2" variant="headingMd">Dashboard de Criação — {shop}</Text>
                <Badge tone={hasPaidPlan ? "success" : "attention"}>
                  {hasPaidPlan ? "Plano Ativo" : "Plano Gratuito / Demonstração"}
                </Badge>
              </Box>
              
              <FormLayout>
                <TextField
                  label="Produto da Shopify que deseja anunciar"
                  value={productName}
                  onChange={(v) => setProductName(v)}
                  autoComplete="off"
                  placeholder="Ex: Alisador de Cabelo Profissional"
                />
                <Button variant="primary" onClick={handleGenerate} size="large">
                  Gerar Anúncio de Alta Conversão de Forma Automática
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
