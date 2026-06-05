const logoFooter = require('./shared/logoFooter');
const { IMAGES } = require('./shared/constants');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

const passwordResetEmailTemplate = ({ userName, resetCode, language }) => {
  const resetUrl = `${process.env.LANDING_URL}/reset-password?code=${resetCode}`;
  const templates = {
    en: {
      subject: 'Password Reset Request',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
        <!-- Outer Table for Centering and Max Width -->
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="
            border-collapse: collapse;
            max-width: 680px;
            background-color: #ffffff;
          "
        >
          <tr>
            <td
              align="center"
              style="padding-left: 60px; background-color: #f2f2f7"
            >
              <!-- Logo Section -->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td
                    align="left"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerLogo}
                      alt="Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                  </td>
                  <td
                    align="right"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerRedLine}
                      alt="Arrow Icon"
                      width="145"
                      height="221"
                      style="display: block; border: 0"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td
              style="
                padding: 0px 60px 40px 60px;
                font-family: Arial, sans-serif;

                color: #1A202C;
                background-color: #f2f2f7;
                margin-top: 70px;
              "
            >
              <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                >Dear ${userName},</strong
              >

                             <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 We received a request to reset your password for your Car Click account. 
               </p>  
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Please click the button below to reset your password:
               </p>
               
               <!-- Reset Password Button -->
               <table
                 border="0"
                 cellpadding="0"
                 cellspacing="0"
                 width="100%"
                 style="margin: 30px 0;"
               >
                 <tr>
                   <td align="center">
                     <table
                       border="0"
                       cellpadding="0"
                       cellspacing="0"
                       style="border-collapse: collapse;"
                     >
                       <tr>
                         <td
                           align="center"
                           style="
                             background-color: #DC2626;
                             border-radius: 8px;
                             padding: 12px 24px;
                           "
                         >
                           <a
                             href="${resetUrl}"
                             target="_blank"
                             style="
                               color: #ffffff;
                               text-decoration: none;
                               font-family: Arial, sans-serif;
                               font-size: 16px;
                               font-weight: 600;
                               display: inline-block;
                             "
                           >
                             Reset Password
                           </a>
                         </td>
                       </tr>
                     </table>
                   </td>
                 </tr>
               </table>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Thank you for placing your trust in Car Click.
               </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Best regards,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Team Car Click
                </p>
              </p>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td
              align="center"
            >
              ${logoFooter(language)}
          </tr>
        </table>
      </center>
    </body>`,
    },
    nl: {
      subject: 'Uw Reservering is Bevestigd',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
        <!-- Outer Table for Centering and Max Width -->
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="
            border-collapse: collapse;
            max-width: 680px;
            background-color: #ffffff;
          "
        >
          <tr>
            <td
              align="center"
              style="padding-left: 60px; background-color: #f2f2f7"
            >
              <!-- Logo Section -->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td
                    align="left"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerLogo}
                      alt="Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                    </td>
                  <td
                    align="right"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerRedLine}
                      alt="Arrow Icon"
                      width="145"
                      height="221"
                      style="display: block; border: 0"
                    />
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
          <tr>
            <td
              style="
                padding: 0px 60px 40px 60px;
                font-family: Arial, sans-serif;

                color: #1A202C;
                background-color: #f2f2f7;
                margin-top: 70px;
              "
            >
              <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                >Beste ${userName},</strong
              >

                             <p
                 style="
                   font-size: 16px;
                   line-height: 24px;
                   margin-top: 24px;
                   color: #4F5A6899;
                 "
               >
                 We hebben een verzoek ontvangen om uw wachtwoord te resetten voor uw Car Click account.
               </p>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Klik op de onderstaande knop om uw wachtwoord te resetten:
               </p>
               
               <!-- Reset Password Button -->
               <table
                 border="0"
                 cellpadding="0"
                 cellspacing="0"
                 width="100%"
                 style="margin: 30px 0;"
               >
                 <tr>
                   <td align="center">
                     <table
                       border="0"
                       cellpadding="0"
                       cellspacing="0"
                       style="border-collapse: collapse;"
                     >
                       <tr>
                         <td
                           align="center"
                           style="
                             background-color: #DC2626;
                             border-radius: 8px;
                             padding: 12px 24px;
                           "
                         >
                           <a
                             href="${resetUrl}"
                             target="_blank"
                             style="
                               color: #ffffff;
                               text-decoration: none;
                               font-family: Arial, sans-serif;
                               font-size: 16px;
                               font-weight: 600;
                               display: inline-block;
                             "
                           >
                             Wachtwoord Resetten
                           </a>
                         </td>
                       </tr>
                     </table>
                   </td>
                 </tr>
               </table>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Bedankt voor uw vertrouwen in Car Click.
               </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Met vriendelijke groet,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Team Car Click
                </p>
              </p>
                    </td>
                  </tr>
                  
          <!-- Footer Section -->
          <tr>
            <td
              align="center"
            >
              ${logoFooter(language)}
                  </tr>
                </table>
      </center>
    </body>`,
    },
    fr: {
      subject: 'Votre Réservation a été Confirmée',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
        <!-- Outer Table for Centering and Max Width -->
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="
            border-collapse: collapse;
            max-width: 680px;
            background-color: #ffffff;
          "
        >
          <tr>
            <td
              align="center"
              style="padding-left: 60px; background-color: #f2f2f7"
            >
              <!-- Logo Section -->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td
                    align="left"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerLogo}
                      alt="Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                    </td>
                  <td
                    align="right"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerRedLine}
                      alt="Arrow Icon"
                      width="145"
                      height="221"
                      style="display: block; border: 0"
                    />
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
          <tr>
            <td
              style="
                padding: 0px 60px 40px 60px;
                font-family: Arial, sans-serif;

                color: #1A202C;
                background-color: #f2f2f7;
                margin-top: 70px;
              "
            >
              <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                >Cher ${userName},</strong
              >

                             <p
                 style="
                   font-size: 16px;
                   line-height: 24px;
                   margin-top: 24px;
                   color: #4F5A6899;
                 "
               >
                 Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte Car Click.
               </p>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Veuillez cliquer sur le bouton ci-dessous pour réinitialiser votre mot de passe :
               </p>
               
               <!-- Reset Password Button -->
               <table
                 border="0"
                 cellpadding="0"
                 cellspacing="0"
                 width="100%"
                 style="margin: 30px 0;"
               >
                 <tr>
                   <td align="center">
                     <table
                       border="0"
                       cellpadding="0"
                       cellspacing="0"
                       style="border-collapse: collapse;"
                     >
                       <tr>
                         <td
                           align="center"
                           style="
                             background-color: #DC2626;
                             border-radius: 8px;
                             padding: 12px 24px;
                           "
                         >
                           <a
                             href="${resetUrl}"
                             target="_blank"
                             style="
                               color: #ffffff;
                               text-decoration: none;
                               font-family: Arial, sans-serif;
                               font-size: 16px;
                               font-weight: 600;
                               display: inline-block;
                             "
                           >
                             Réinitialiser le Mot de Passe
                           </a>
                         </td>
                       </tr>
                     </table>
                   </td>
                 </tr>
               </table>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Merci de votre confiance en Car Click.
               </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Cordialement,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Équipe Car Click
                </p>
              </p>
                    </td>
                  </tr>
                  
          <!-- Footer Section -->
          <tr>
            <td
              align="center"
            >
              ${logoFooter(language)}
                  </tr>
                </table>
      </center>
    </body>`,
    },
    it: {
      subject: 'La Tua Prenotazione è Stata Confermata',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
        <!-- Outer Table for Centering and Max Width -->
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="
            border-collapse: collapse;
            max-width: 680px;
            background-color: #ffffff;
          "
        >
          <tr>
            <td
              align="center"
              style="padding-left: 60px; background-color: #f2f2f7"
            >
              <!-- Logo Section -->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td
                    align="left"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerLogo}
                      alt="Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                    </td>
                  <td
                    align="right"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerRedLine}
                      alt="Arrow Icon"
                      width="145"
                      height="221"
                      style="display: block; border: 0"
                    />
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
          <tr>
            <td
              style="
                padding: 0px 60px 40px 60px;
                font-family: Arial, sans-serif;

                color: #1A202C;
                background-color: #f2f2f7;
                margin-top: 70px;
              "
            >
              <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                >Gentile ${userName},</strong
              >

                             <p
                 style="
                   font-size: 16px;
                   line-height: 24px;
                   margin-top: 24px;
                   color: #4F5A6899;
                 "
               >
                 Abbiamo ricevuto una richiesta di reset della password per il vostro account Car Click.
               </p>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Cliccate sul pulsante qui sotto per reimpostare la password:
               </p>
               
               <!-- Reset Password Button -->
               <table
                 border="0"
                 cellpadding="0"
                 cellspacing="0"
                 width="100%"
                 style="margin: 30px 0;"
               >
                 <tr>
                   <td align="center">
                     <table
                       border="0"
                       cellpadding="0"
                       cellspacing="0"
                       style="border-collapse: collapse;"
                     >
                       <tr>
                         <td
                           align="center"
                           style="
                             background-color: #DC2626;
                             border-radius: 8px;
                             padding: 12px 24px;
                           "
                         >
                           <a
                             href="${resetUrl}"
                             target="_blank"
                             style="
                               color: #ffffff;
                               text-decoration: none;
                               font-family: Arial, sans-serif;
                               font-size: 16px;
                               font-weight: 600;
                               display: inline-block;
                             "
                           >
                             Reimposta Password
                           </a>
                         </td>
                       </tr>
                     </table>
                   </td>
                 </tr>
               </table>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Grazie per la vostra fiducia in Car Click.
               </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Cordiali saluti,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Team Car Click
                </p>
              </p>
                    </td>
                  </tr>
                  
          <!-- Footer Section -->
          <tr>
            <td
              align="center"
            >
              ${logoFooter(language)}
                  </tr>
                </table>
      </center>
    </body>`,
    },
    de: {
      subject: 'Ihre Reservierung wurde Bestätigt',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
        <!-- Outer Table for Centering and Max Width -->
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="
            border-collapse: collapse;
            max-width: 680px;
            background-color: #ffffff;
          "
        >
          <tr>
            <td
              align="center"
              style="padding-left: 60px; background-color: #f2f2f7"
            >
              <!-- Logo Section -->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td
                    align="left"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerLogo}
                      alt="Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                    </td>
                  <td
                    align="right"
                    valign="middle"
                  >
                    <img
                      src=${IMAGES.headerRedLine}
                      alt="Arrow Icon"
                      width="145"
                      height="221"
                      style="display: block; border: 0"
                    />
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
          <tr>
            <td
              style="
                padding: 0px 60px 40px 60px;
                font-family: Arial, sans-serif;

                color: #1A202C;
                background-color: #f2f2f7;
                margin-top: 70px;
              "
            >
              <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                >Sehr geehrte/r ${userName},</strong
              >

                             <p
                 style="
                   font-size: 16px;
                   line-height: 24px;
                   margin-top: 24px;
                   color: #4F5A6899;
                 "
               >
                 Wir haben eine Anfrage zur Zurücksetzung Ihres Passworts für Ihr Car Click-Konto erhalten.
               </p>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Bitte klicken Sie auf die Schaltfläche unten, um Ihr Passwort zurückzusetzen:
               </p>
               
               <!-- Reset Password Button -->
               <table
                 border="0"
                 cellpadding="0"
                 cellspacing="0"
                 width="100%"
                 style="margin: 30px 0;"
               >
                 <tr>
                   <td align="center">
                     <table
                       border="0"
                       cellpadding="0"
                       cellspacing="0"
                       style="border-collapse: collapse;"
                     >
                       <tr>
                         <td
                           align="center"
                           style="
                             background-color: #DC2626;
                             border-radius: 8px;
                             padding: 12px 24px;
                           "
                         >
                           <a
                             href="${resetUrl}"
                             target="_blank"
                             style="
                               color: #ffffff;
                               text-decoration: none;
                               font-family: Arial, sans-serif;
                               font-size: 16px;
                               font-weight: 600;
                               display: inline-block;
                             "
                           >
                             Passwort Zurücksetzen
                           </a>
                         </td>
                       </tr>
                     </table>
                   </td>
                 </tr>
               </table>
               
               <p style="
                 font-size: 16px;
                 line-height: 24px;
                 color: #4F5A6899;"
               >
                 Vielen Dank für Ihr Vertrauen in Car Click.
               </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Freundliche Grüße,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Team Car Click
                </p>
              </p>
                    </td>
                  </tr>
                  
          <!-- Footer Section -->
          <tr>
            <td
              align="center"
            >
              ${logoFooter(language)}
                  </tr>
                </table>
      </center>
    </body>`,
    },
  };

  const template = templates[language] || templates.en;
  return template.body;
};

module.exports = { passwordResetEmailTemplate, languages };
