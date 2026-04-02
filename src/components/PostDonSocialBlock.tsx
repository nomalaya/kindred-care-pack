import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Share2, Eye } from "lucide-react";
import { SocialIcons } from "@/components/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/socialLinks";
import { toast } from "sonner";

interface Props {
  beneficiaryName: string;
}

const PostDonSocialBlock = ({ beneficiaryName }: Props) => {
  const handleShare = async () => {
    const text = `Je viens d'aider ${beneficiaryName} via CashForCause. Rejoignez-moi ! ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `J'ai aidé ${beneficiaryName}`,
          text,
          url: window.location.origin,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="bg-card rounded-2xl p-6 border shadow-card text-center space-y-4"
    >
      <h3 className="text-lg font-semibold text-foreground">
        Vous venez d'aider {beneficiaryName}
      </h3>
      <p className="text-sm text-muted-foreground">
        Votre don permet l'envoi d'un colis alimentaire sous 48h.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={handleShare} className="bg-cta hover:bg-cta/90 text-cta-foreground">
          <Share2 className="h-4 w-4 mr-2" />
          Partager mon action
        </Button>
        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            Voir l'impact réel
          </Button>
        </a>
      </div>

      <a
        href={SOCIAL_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Suivre les actions CashForCause
      </a>

      <div className="pt-2 flex justify-center">
        <SocialIcons variant="post-don" />
      </div>
    </motion.div>
  );
};

export default PostDonSocialBlock;
