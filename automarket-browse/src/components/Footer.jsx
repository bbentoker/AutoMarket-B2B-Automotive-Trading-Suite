import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Linkedin, Mail, MapPin, Phone, Send, ExternalLink, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/toast";
import { IconContainer } from "./ui/icon-container";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";
import { CookiePolicyModal } from "./CookiePolicyModal";
import { TermsOfServiceModal } from "./TermsOfServiceModal";
import { useTranslation } from "../i18n";

export function Footer({ hideScrollTop = false }) {
  // Footer height control - adjust this value to tune the entire footer height
  // All spacing will scale proportionally with this value
  // Recommended range: 400-800px
  const FOOTER_HEIGHT = 650; // pixels

  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [focusedSection, setFocusedSection] = useState(null);
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
    if (link.name === "Privacy Policy") {
      setIsPrivacyModalOpen(true);
    } else if (link.name === "Cookie Policy") {
      setIsCookieModalOpen(true);
    } else if (link.name === "Terms of Service") {
      setIsTermsModalOpen(true);
    } else if (link.name === "About Us") {
      window.open(link.href, '_blank');
    } else if (link.name === "Contact") {
      window.open(link.href, '_blank');
    } else if (link.name === "Browse Cars") {
      window.location.href = "/";
    } else if (link.name === "Sell Cars") {
      window.open(link.href, '_blank');
    } else if (link.name === "Register For Free") {
      window.open(link.href, '_blank');
    } else if (link.name === "Dealer Login") {
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
        { name: t('footer.termsOfService'), href: "#" },
        { name: t('footer.privacyPolicy'), href: "#" },
        { name: t('footer.cookiePolicy'), href: "#" },
      ],
    },
  ];

  const socialLinks = [{ name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "#" }];



  return (
    <footer
      className="bg-c-grey border-t border-gray-100 mx-20 px-48"
      style={{
        height: `${FOOTER_HEIGHT}px`,
        fontFamily: "Inter, Inter Fallback, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontStyle: "normal"
      }}
    >
      <div className="container mx-auto pb-20  lg:px-4 pt-16" >
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
          style={{
            gap: `${FOOTER_HEIGHT * 0.0125}px`,
            rowGap: `${FOOTER_HEIGHT * 0.0125}px`
          }}
        >
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start mt-2">
            <div className="flex flex-col items-center lg:items-start gap-2" >
              <div>
                <img src="https://cdn.automarket.example.com/favicon-dark.png" alt="AutoMarket" className="h-10" />
              </div>
            </div>
            <p className="text-gray-600 max-w-md text-center text-md lg:text-left pt-4" >
              {t('footer.description')}
            </p>

            <div className="mt-1 w-2/3 pt-4">
              <div className="text-sm font-semibold text-gray-900 mb-2 ">{t('footer.subscribeToNewsletter')}</div>
              {isSubscribed ? (
                <div
                  className="text-[#20BFB6] font-medium"
                >
                  {t('footer.thanksForSubscribing')}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-full ">
                  <div className="relative flex-1 w-full ">
                    <Input
                      type="email"
                      placeholder={t('footer.enterYourEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl border-gray-200/80 focus:border-[#20BFB6]/50 focus:ring-[#20BFB6]/50 focus-visible:ring-[#20BFB6]/50 focus-visible:ring-offset-0 pr-10 w-full"
                      required
                    />
                    <Button
                      type="submit"
                      size="icon-sm"
                      rounded="lg"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#20BFB6] hover:bg-[#1A9A93] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                    >
                      <Send className="h-4 w-4 stroke-[2.5px]" />
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <div className="flex flex-col pt-8 gap-4">
              <div className="flex items-start gap-3">
                <IconContainer variant="subtle" size="sm" rounded="full" className="flex-shrink-0 !bg-[#F8E4E7]">
                  <MapPin className="h-4 w-4 stroke-[2.5px] text-c-red " />
                </IconContainer>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Produktiv bilhandel i Sverige AB</p>
                  <p className="text-sm text-gray-600">Norrlandsgatan 16</p>
                  <p className="text-sm text-gray-600">111 43 Stockholm</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconContainer variant="subtle" size="sm" rounded="full" className="flex-shrink-0 !bg-[#F8E4E7]">
                  <Mail className="h-4 w-4 stroke-[2.5px] text-c-red " />
                </IconContainer>
                <div>
                  <p className="text-sm text-gray-800">Info@automarket.example.com</p>
                </div>
              </div>
            </div>
          </div>

          {footerLinks.map((column, idx) => (
            <div
              key={idx}
              className={`${column.title === "Company" ? "relative" : ""}`}
              onMouseEnter={() => setFocusedSection(column.title)}
              onMouseLeave={() => setFocusedSection(null)}
            >
              <div
                className={`text-sm font-semibold mb-3 sm:mb-4 transition-colors duration-300 block ${focusedSection === column.title
                  ? "text-[#20BFB6]"
                  : "text-gray-900"
                  }`}
              >
                {column.title}
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    {link.href === "#key-features" ? (
                      <div
                        onClick={() => {
                          const section = document.getElementById("key-features");
                          if (section) {
                            section.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="group flex items-center text-gray-500 hover:text-[#20BFB6] transition-colors duration-300 text-sm cursor-pointer font-medium"
                      >
                        <span className="relative inline-flex items-center">
                          {link.name}
                          <span className="absolute -bottom-0.5 left-0 h-[2px] w-full scale-x-0 rounded-full bg-[#20BFB6] opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"></span>
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleLinkClick(link)}
                        className="group flex items-center text-gray-500 hover:text-[#20BFB6] transition-colors duration-300 text-sm cursor-pointer font-medium"
                      >
                        <span className="relative inline-flex items-center">
                          {link.name}
                          <span className="absolute -bottom-0.5 left-0 h-[2px] w-full scale-x-0 rounded-full bg-[#20BFB6] opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"></span>
                        </span>
                        {link.name === "About Us" && (
                          <ExternalLink className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        {link.name === "Contact" && (
                          <ArrowRight className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        )}
                        {link.name === "Sell Cars" && (
                          <ExternalLink className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        {link.name === "Register For Free" && (
                          <ExternalLink className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        {link.name === "Dealer Login" && (
                          <ExternalLink className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="border-t-[1px] border-gray-400 mt-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mt-10">
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLinkClick(social)}
                  className="bg-white p-2 rounded-xl text-gray-600 hover:text-[#20BFB6] border border-gray-200/80 hover:border-[#20BFB6]/30 hover:shadow-[#20BFB6]/5 transition-all duration-300 hover:shadow-md"
                  aria-label={social.name}
                >
                  {React.cloneElement(social.icon, { className: "h-5 w-5 stroke-[2px]" })}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-700 font-Inter">© {new Date().getFullYear()} AutoMarket. {t('footer.allRightsReserved')}</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && !hideScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-[#20BFB6] text-white shadow-lg hover:shadow-[#20BFB6]/20 z-50 transition-all duration-300 hover:scale-110"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Cookie Policy Modal */}
      <CookiePolicyModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </footer>
  );
} 