const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Listing = sequelize.define(
  'Listing',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    horsepower: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    registration_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    deal_stage: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    first_registration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    km_stand: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vin_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    internal_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    co2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    listing_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    assigned_to_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    brand_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    fuel_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    transmission_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    seat: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    features: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vat_or_margin: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'VAT treatment: "Excl. VAT" or "Incl. VAT"',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    vehicle_category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    interior_color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    trim_package: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    engine: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    service_history: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    number_of_owners: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // from zoho
    zoho_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    proforma_invoice_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    additional_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tracking_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    proforma_inv_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expected_pick_up_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expected_delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expected_close_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    closing_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    transport_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    car_delivery_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pick_up_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    document_sent_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seller_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    seller_company: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contact_person: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telephone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    submitted_offer_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    amount_sold_for: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    buyer_company_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    buyer_s_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    payment_send_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    invoice_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    expiration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Expiration time in hours',
    },
    is_viewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    car_studio_processed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    previous_accidents: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reference_no: {
      type: DataTypes.STRING(5),
      allowNull: true,
      unique: true,
    },
    logo_filename: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_listingsiteb: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_listingsitea: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_listingsitec: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    seller_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount_purchased: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    belgium_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    avg_selling_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    listingsitea_link: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'listings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Listing;
