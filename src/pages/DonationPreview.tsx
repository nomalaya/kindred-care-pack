import Layout from "@/components/Layout";
import DonationConfirmation from "@/components/DonationConfirmation";

const mockProducts = [
  { id: "1", name: "Riz basmati 1kg" },
  { id: "2", name: "Huile d'olive 1L" },
  { id: "3", name: "Lentilles 500g" },
  { id: "4", name: "Savon de Marseille" },
  { id: "5", name: "Dentifrice" },
  { id: "6", name: "Serviettes hygiéniques" },
];

const DonationPreview = () => (
  <Layout>
    <DonationConfirmation
      beneficiaryName="Aïcha"
      amount={35}
      products={mockProducts}
      emergencyPack={{ id: "urgence", description: "Kit hygiène d'urgence", amount: 5, icon: "🧴" }}
    />
  </Layout>
);

export default DonationPreview;
