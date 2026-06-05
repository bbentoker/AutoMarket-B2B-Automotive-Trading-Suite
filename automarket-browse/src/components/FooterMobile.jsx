import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Mail, MapPin, Phone, Send, ExternalLink, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/toast";
import { IconContainer } from "./ui/icon-container";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";
import { CookiePolicyModal } from "./CookiePolicyModal";
import { TermsOfServiceModal } from "./TermsOfServiceModal";
import { useTranslation } from "../i18n";
export function FooterMobile({ hideScrollTop = false }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      toast({
        title: t('footer.subscribed'),
        description: t('footer.thankYouForSubscribing'),
        variant: "default",
      });
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const handleLinkClick = (link) => {
    const privacyPolicy = t('footer.privacyPolicy');
    const cookiePolicy = t('footer.cookiePolicy');
    const termsOfService = t('footer.termsOfService');
    const aboutUs = t('footer.aboutUs');
    const contact = t('footer.contact');
    const browseCars = t('footer.browseCars');
    const sellCars = t('footer.sellCars');
    const registerForFree = t('footer.registerForFree');
    const dealerLogin = t('footer.dealerLogin');

    if (link.name === privacyPolicy) {
      setIsPrivacyModalOpen(true);
    } else if (link.name === cookiePolicy) {
      setIsCookieModalOpen(true);
    } else if (link.name === termsOfService) {
      setIsTermsModalOpen(true);
    } else if (link.name === aboutUs) {
      window.open(link.href, '_blank');
    } else if (link.name === contact) {
      window.open(link.href, '_blank');
    } else if (link.name === browseCars) {
      window.location.href = "/";
    } else if (link.name === sellCars) {
      window.open(link.href, '_blank');
    } else if (link.name === registerForFree) {
      window.open(link.href, '_blank');
    } else if (link.name === dealerLogin) {
      window.open(link.href, '_blank');
    } else if (link.href === "#" || link.href === "/") {
      // Do nothing for # or / endpoints
      return;
    }
  };

  const footerLinks = [
    {
      title: t('footer.company'),
      links: [
        { name: t('footer.aboutUs'), href: "https://www.automarket.example.com/about" },
        { name: t('footer.careers'), href: "#" },
        { name: t('footer.press'), href: "#" },
        { name: t('footer.contact'), href: "https://www.automarket.example.com/contact-us" },
      ],
    },
    {
      title: t('footer.services'),
      links: [
        { name: t('footer.browseCars'), href: "/" },
        { name: t('footer.sellCars'), href: `${import.meta.env.VITE_DASHBOARD_URL}` },
        { name: t('footer.registerForFree'), href: `${import.meta.env.VITE_LANDING_URL}/register` },
        { name: t('footer.dealerLogin'), href: `${import.meta.env.VITE_LANDING_URL}/login` },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { name: t('footer.helpCenter'), href: "/" },
        { name: t('footer.faqs'), href: "/" },
        { name: t('footer.termsOfService'), href: "/" },
        { name: t('footer.privacyPolicy'), href: "#" },
        { name: t('footer.cookiePolicy'), href: "#" },
      ],
    },
  ];

  const socialLinks = [{ name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "#" }];

  return (
    <footer className="bg-c-grey border-t border-gray-100 px-4 py-8">
      <div className="container mx-auto max-w-md">
        {/* Logo and Description */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-start mb-4">
            <img src="https://cdn.automarket.example.com/favicon-dark.png" alt="AutoMarket" className="h-8" />
          </div>
          <p className="text-gray-600 text-base font-medium leading-relaxed text-left">
            {t('footer.description')}
          </p>
        </motion.div>

        {/* Newsletter Subscription */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-base font-semibold text-gray-900 mb-3 text-left">{t('footer.subscribeToNewsletter')}</div>
          {isSubscribed ? (
            <div className="text-left text-[#20BFB6] font-medium text-base">
              {t('footer.thanksForSubscribing')}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex w-80" >
                <Input
                  type="email"
                  placeholder={t('footer.enterYourEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg  border-gray-200 focus:border-[#20BFB6]/50 focus:ring-[#20BFB6]/50 text-base pr-10"
                  required
                />
                <Button
                  type="submit"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-[#20BFB6] hover:bg-[#1A9A93] rounded-md"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <IconContainer variant="subtle" size="sm" rounded="full" className="flex-shrink-0 !bg-[#F8E4E7]">
                <MapPin className="h-3 w-3 text-c-red" />
              </IconContainer>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Produktiv bilhandel i Sverige AB</p>
                <p className="text-sm text-gray-600">Norrlandsgatan 16</p>
                <p className="text-sm text-gray-600">111 43 Stockholm</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconContainer variant="subtle" size="sm" rounded="full" className="flex-shrink-0 !bg-[#F8E4E7]">
                <Mail className="h-3 w-3 text-c-red" />
              </IconContainer>
              <p className="text-sm text-gray-800">Info@automarket.example.com</p>
            </div>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          className="space-y-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {footerLinks.map((column, idx) => (
            <div key={idx} className="text-left">
              <div className="text-sm font-semibold text-gray-900 mb-2  tracking-wider">{column.title}</div>
              <ul className="space-y-1">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <div
                      onClick={() => handleLinkClick(link)}
                      className="text-sm text-gray-600 hover:text-[#20BFB6] transition-colors duration-300 cursor-pointer text-left"
                    >
                      {link.name}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Social Links and Copyright */}
        <motion.div
          className="border-t border-gray-200 pt-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col items-start gap-4">
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLinkClick(social)}
                  className="bg-white p-2 rounded-lg text-gray-600 hover:text-[#20BFB6] border border-gray-200 hover:border-[#20BFB6]/30 transition-all duration-300"
                  aria-label={social.name}
                >
                  {React.cloneElement(social.icon, { className: "h-4 w-4" })}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-700 text-left">
              © {new Date().getFullYear()} AutoMarket. {t('footer.allRightsReserved')}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && !hideScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-32 right-6 p-3 rounded-full bg-[#20BFB6] text-white shadow-lg z-50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <CookiePolicyModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </footer>
  );
} 