// SECURITY-SANITIZED: OAuth client ID, secret, and redirect URI are env-driven placeholders.
// In the real deployment these pointed to the customer's Zoho CRM tenant.
const axios = require('axios');
const ZohoToken = require('../models/ZohoToken');
const { Op } = require('sequelize');

class ZohoCRMClient {
  constructor() {
    this.baseURL =
      process.env.ZOHO_API_BASE_URL || 'https://www.zohoapis.eu/crm/v3';
    this.tokenInfo = null; // Will be set in getValidToken
  }

  async getValidToken() {
    // Get the latest token
    let token = await ZohoToken.findOne({
      order: [['created_at', 'DESC']],
    });
    if (!token) {
      throw new Error('No Zoho token found in database');
    }
    // Check if expired
    const createdAt = new Date(token.created_at);
    const expiresIn = token.expires_in; // in seconds
    const now = new Date();
    const expiresAt = new Date(
      createdAt.getTime() + expiresIn * 1000 - 60 * 1000
    ); // 1 min early
    if (now >= expiresAt) {
      // Refresh token
      token = await this.refreshToken(token.refresh_token);
    }
    this.tokenInfo = token;
    return token.access_token;
  }

  async refreshToken(refreshToken) {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const redirectUri = process.env.ZOHO_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Zoho OAuth env vars');
    }
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');
    params.append('redirect_uri', redirectUri);
    const url = 'https://accounts.zoho.eu/oauth/v2/token';
    const response = await axios.post(url, params);
    const data = response.data;
    if (!data.access_token) {
      throw new Error('Failed to refresh Zoho access token');
    }
    // Save new token in DB
    const newToken = await ZohoToken.create({
      access_token: data.access_token,
      refresh_token: refreshToken, // Zoho returns same refresh_token
      expires_in: data.expires_in,
      created_at: new Date(),
    });
    return newToken;
  }

  async getRecord(module, id) {
    const accessToken = await this.getValidToken();
    const response = await axios.get(`${this.baseURL}/${module}/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async updateRecord(module, id, data) {
    const accessToken = await this.getValidToken();
    const response = await axios.put(
      `${this.baseURL}/${module}/${id}`,
      {
        data: [data],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async createRecord(module, data) {
    const accessToken = await this.getValidToken();
    const response = await axios.post(
      `${this.baseURL}/${module}`,
      {
        data: [data],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async deleteRecord(module, id) {
    const accessToken = await this.getValidToken();
    const response = await axios.delete(`${this.baseURL}/${module}/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async getLayouts(module) {
    const accessToken = await this.getValidToken();
    const response = await axios.get(
      `${this.baseURL}/settings/layouts?module=${module}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async getPipelines(layoutId) {
    const accessToken = await this.getValidToken();
    const response = await axios.get(
      `${this.baseURL}/settings/pipeline?layout_id=${layoutId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
}

module.exports = {
  ZohoCRMClient,
};
