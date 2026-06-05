const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Template discovery - scan for email templates
function getAvailableTemplates() {
  const templates = {};

  // Regular email templates
  const emailDir = path.join(__dirname, 'src/templates/emails');
  const emailFiles = fs
    .readdirSync(emailDir)
    .filter(
      (file) =>
        file.endsWith('.js') &&
        !file.includes('Service') &&
        !file.includes('Example')
    );

  emailFiles.forEach((file) => {
    const name = file.replace('.js', '');
    templates[name] = {
      type: 'regular',
      path: path.join(emailDir, file),
    };
  });

  // Stage templates
  const stageDir = path.join(__dirname, 'src/templates/emails/stages');
  if (fs.existsSync(stageDir)) {
    const stageFiles = fs
      .readdirSync(stageDir)
      .filter((file) => file.endsWith('.js'));
    stageFiles.forEach((file) => {
      const name = file.replace('.js', '');
      templates[`stage_${name}`] = {
        type: 'stage',
        path: path.join(stageDir, file),
      };
    });
  }

  return templates;
}

// Sample data for different template types
const sampleData = {
  welcomeEmail: {
    dealerName: 'John Smith',
    companyName: 'Smith Auto Sales',
    email: 'john@smithauto.com',
  },
  welcomeCompleteEmail: {
    dealerName: 'John Smith',
    companyName: 'Smith Auto Sales',
    email: 'john@smithauto.com',
  },
  reservationEmail: {
    userName: 'Jane Doe',
    listingDetails: {
      make: 'BMW',
      model: 'X5',
      year: 2020,
      price: 45000,
      mileage: 25000,
    },
  },
  counterOfferEmail: {
    dealerName: 'John Smith',
    listingDetails: {
      make: 'Mercedes',
      model: 'C-Class',
      year: 2021,
      price: 35000,
    },
    counterOffer: {
      amount: 32000,
      comment: 'Best price we can offer',
    },
    offerId: 'OFF-12345',
  },
  newsLetterEmail: {
    userName: 'Alex',
    footerText: 'Thank you for choosing AutoMarket - Your premium car platform!',
    contactInfo: {
      address: 'Grietje Steenbeekstr 14, Veendam, Groton, 9641 AT, Sweden',
      phone: '+46 123 456 789',
    },
  },
};

// Main preview page
app.get('/', (req, res) => {
  const templates = getAvailableTemplates();

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template Preview</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
                margin: 0; 
                background: #f5f5f5; 
            }
            .container { 
                max-width: 1400px; 
                margin: 0 auto; 
                padding: 20px; 
                display: grid; 
                grid-template-columns: 350px 1fr; 
                gap: 20px; 
                height: 100vh; 
            }
            .sidebar { 
                background: white; 
                padding: 20px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                overflow-y: auto; 
            }
            .preview { 
                background: white; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                overflow: hidden; 
            }
            select, textarea, input { 
                width: 100%; 
                padding: 10px; 
                margin: 10px 0; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                font-size: 14px; 
            }
            textarea { 
                height: 200px; 
                font-family: monospace; 
                resize: vertical; 
            }
            button { 
                background: #007bff; 
                color: white; 
                border: none; 
                padding: 12px 20px; 
                border-radius: 4px; 
                cursor: pointer; 
                font-size: 14px; 
                width: 100%; 
                margin: 10px 0; 
            }
            button:hover { 
                background: #0056b3; 
            }
            .preview-frame { 
                width: 100%; 
                height: 100%; 
                border: none; 
            }
            h2 { 
                margin: 0 0 20px 0; 
                color: #333; 
            }
            .section { 
                margin-bottom: 25px; 
                padding-bottom: 20px; 
                border-bottom: 1px solid #eee; 
            }
            .section:last-child { 
                border-bottom: none; 
            }
            label { 
                display: block; 
                margin-bottom: 5px; 
                font-weight: 500; 
                color: #555; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="sidebar">
                <h2>📧 Email Preview</h2>
                
                <div class="section">
                    <label for="template">Select Template:</label>
                    <select id="template" onchange="loadTemplate()">
                        <option value="">Choose a template...</option>
                        ${Object.keys(templates)
                          .map(
                            (name) =>
                              `<option value="${name}">${name.replace('stage_', 'Stage: ')}</option>`
                          )
                          .join('')}
                    </select>
                </div>
                
                <div class="section">
                    <label for="language">Language:</label>
                    <select id="language" onchange="updatePreview()">
                        <option value="en">English</option>
                        <option value="nl">Nederlands</option>
                        <option value="fr">Français</option>
                        <option value="it">Italiano</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>
                
                <div class="section">
                    <label for="data">Template Data (JSON):</label>
                    <textarea id="data" placeholder="Enter JSON data for template..."></textarea>
                    <button onclick="loadSampleData()">Load Sample Data</button>
                </div>
                
                <button onclick="updatePreview()">🔄 Update Preview</button>
                <button onclick="openInNewTab()">🔗 Open in New Tab</button>
            </div>
            
            <div class="preview">
                <iframe id="preview-frame" class="preview-frame" src="/preview/empty"></iframe>
            </div>
        </div>

        <script>
            let currentTemplate = '';
            
            function loadTemplate() {
                currentTemplate = document.getElementById('template').value;
                if (currentTemplate) {
                    loadSampleData();
                }
            }
            
            function loadSampleData() {
                if (!currentTemplate) return;
                
                fetch('/sample-data/' + currentTemplate)
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('data').value = JSON.stringify(data, null, 2);
                        updatePreview();
                    })
                    .catch(err => console.error('Error loading sample data:', err));
            }
            
            function updatePreview() {
                if (!currentTemplate) return;
                
                const language = document.getElementById('language').value;
                const data = document.getElementById('data').value;
                
                let parsedData = {};
                try {
                    parsedData = data ? JSON.parse(data) : {};
                } catch (e) {
                    alert('Invalid JSON in template data');
                    return;
                }
                
                const params = new URLSearchParams({
                    template: currentTemplate,
                    language: language,
                    data: JSON.stringify(parsedData)
                });
                
                document.getElementById('preview-frame').src = '/preview?' + params.toString();
            }
            
            function openInNewTab() {
                const frame = document.getElementById('preview-frame');
                if (frame.src) {
                    window.open(frame.src, '_blank');
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Preview endpoint
app.get('/preview', (req, res) => {
  const { template, language = 'en', data = '{}' } = req.query;

  if (!template) {
    return res.send('<p>No template selected</p>');
  }

  try {
    // Clear require cache to get fresh template
    const templates = getAvailableTemplates();
    const templateInfo = templates[template];

    if (!templateInfo) {
      return res.send(`<p>Template '${template}' not found</p>`);
    }

    delete require.cache[require.resolve(templateInfo.path)];

    let html = '';
    const templateData = JSON.parse(data);

    if (templateInfo.type === 'stage') {
      const {
        [template.replace('stage_', '') + 'Template']: templateFunc,
      } = require(templateInfo.path);
      const result = templateFunc(templateData, language);
      html = result.body || result;
    } else {
      const templateFunc = require(templateInfo.path);
      html = templateFunc(templateData);
    }

    res.send(html);
  } catch (error) {
    res.send(
      `<pre style="color: red; padding: 20px;">Error: ${error.message}\n\n${error.stack}</pre>`
    );
  }
});

// Empty preview endpoint
app.get('/preview/empty', (req, res) => {
  res.send(`
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: #666; font-family: system-ui;">
      <div style="text-align: center;">
        <h3>📧 Email Preview</h3>
        <p>Select a template to start previewing</p>
      </div>
    </div>
  `);
});

// Sample data endpoint
app.get('/sample-data/:template', (req, res) => {
  const { template } = req.params;
  const cleanTemplate = template.replace('stage_', '');

  // Return sample data based on template name
  const data = sampleData[cleanTemplate] ||
    sampleData.welcomeEmail || {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Sample message content',
    };

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`🚀 Email Preview Server running at http://localhost:${PORT}`);
  console.log('📧 Design and test your email templates with live preview!');
});
