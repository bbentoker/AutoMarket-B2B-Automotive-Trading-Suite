const Offer = require('./Offer');
const Listing = require('./Listing');
const ListingPhotos = require('./ListingPhotos');
const User = require('./User');
const UserActivity = require('./userActivity');
const Newsletter = require('./Newsletter');
const NewsletterContact = require('./NewsletterContact');
const Country = require('./Country');
const DamagedParts = require('./DamagedParts');
const Invoice = require('./Invoice');
const Blog = require('./Blog');
const SavedListings = require('./SavedListings');
const UserReportOptions = require('./UserReportOptions');
const LoginCode = require('./LoginCode');
const ListingSiteAInventory = require('./listingsiteaInventory');
const ResetPasswordCode = require('./ResetPasswordCode');
const WeeklyReportEmail = require('./WeeklyReportEmail');
const WishlistOptions = require('./WishlistOptions');
const UserWishlistSendingOptions = require('./UserWishlistSendingOptions');
const WishlistEmail = require('./WishlistEmail');

// LoginCode associations
LoginCode.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many login codes (but only one active at a time)
User.hasMany(LoginCode, {
  foreignKey: 'user_id',
  as: 'loginCodes',
});

// Offer associations
Offer.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing',
});

Offer.belongsTo(User, {
  foreignKey: 'dealer_id',
  as: 'dealer',
});

// Listing associations
Listing.hasMany(Offer, {
  foreignKey: 'listing_id',
  as: 'offers',
});

// Listing belongs to User (assigned dealer)
Listing.belongsTo(User, {
  foreignKey: 'assigned_to_id',
  as: 'assignedTo',
});

// User (Dealer) associations
User.hasMany(Offer, {
  foreignKey: 'dealer_id',
  as: 'offers',
});

// User has many assigned listings
User.hasMany(Listing, {
  foreignKey: 'assigned_to_id',
  as: 'assignedListings',
});

// UserActivity associations
UserActivity.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

UserActivity.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing',
});

// Reverse associations
User.hasMany(UserActivity, {
  foreignKey: 'user_id',
  as: 'activities',
});

Listing.hasMany(UserActivity, {
  foreignKey: 'listing_id',
  as: 'activities',
});

// Newsletter associations
Newsletter.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing',
});

Newsletter.belongsTo(NewsletterContact, {
  foreignKey: 'newsletter_contact_id',
  as: 'contact',
});

NewsletterContact.hasMany(Newsletter, {
  foreignKey: 'newsletter_contact_id',
  as: 'newsletters',
});

// Add to Listing associations
Listing.hasMany(Newsletter, {
  foreignKey: 'listing_id',
  as: 'newsletters',
});

// DamagedParts associations
DamagedParts.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing',
});

Listing.hasMany(DamagedParts, {
  foreignKey: 'listing_id',
  as: 'damagedParts',
});

// NewsletterContact associations
NewsletterContact.belongsTo(Country, {
  foreignKey: 'country_id',
  as: 'country',
});

Country.hasMany(NewsletterContact, {
  foreignKey: 'country_id',
  as: 'newsletterContacts',
});

// Invoice associations
Invoice.belongsTo(User, {
  foreignKey: 'dealer_id',
  as: 'dealer',
});

Invoice.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing',
});

// User (Dealer) has many invoices
User.hasMany(Invoice, {
  foreignKey: 'dealer_id',
  as: 'invoices',
});

// Listing can have many invoices (optional)
Listing.hasMany(Invoice, {
  foreignKey: 'listing_id',
  as: 'invoices',
});

// Blog associations
Blog.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author',
});

// User can have many blogs (as author)
User.hasMany(Blog, {
  foreignKey: 'author_id',
  as: 'blogs',
});

// SavedListings associations
SavedListings.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

SavedListings.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing',
});

// User has many saved listings
User.hasMany(SavedListings, {
  foreignKey: 'user_id',
  as: 'savedListings',
});

// Listing can be saved by many users
Listing.hasMany(SavedListings, {
  foreignKey: 'listing_id',
  as: 'savedBy',
});

// UserReportOptions associations
UserReportOptions.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has one report options
User.hasOne(UserReportOptions, {
  foreignKey: 'user_id',
  as: 'reportOptions',
});

// ListingSiteAInventory associations
ListingSiteAInventory.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller',
});

// User has many ListingSiteAInventory records
User.hasMany(ListingSiteAInventory, {
  foreignKey: 'seller_id',
  as: 'inventory',
});

// Advert associations
const Advert = require('./advert');

Advert.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller',
});

// User has many Adverts
User.hasMany(Advert, {
  foreignKey: 'seller_id',
  as: 'adverts',
});

// ResetPasswordCode associations
ResetPasswordCode.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many reset password codes
User.hasMany(ResetPasswordCode, {
  foreignKey: 'user_id',
  as: 'resetPasswordCodes',
});

// WeeklyReportEmail associations
WeeklyReportEmail.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many weekly report emails
User.hasMany(WeeklyReportEmail, {
  foreignKey: 'user_id',
  as: 'weeklyReportEmails',
});

// WishlistOptions associations
WishlistOptions.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// listing_id references listingsitea_adverts.id (historical column name)
WishlistOptions.belongsTo(Advert, {
  foreignKey: 'listing_id',
  as: 'advert',
});

// User has many wishlist options
User.hasMany(WishlistOptions, {
  foreignKey: 'user_id',
  as: 'wishlistOptions',
});

Advert.hasMany(WishlistOptions, {
  foreignKey: 'listing_id',
  as: 'wishlistOptions',
});

// UserWishlistSendingOptions associations
UserWishlistSendingOptions.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has one wishlist sending options
User.hasOne(UserWishlistSendingOptions, {
  foreignKey: 'user_id',
  as: 'wishlistSendingOptions',
});

// WishlistEmail associations
WishlistEmail.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many wishlist emails
User.hasMany(WishlistEmail, {
  foreignKey: 'user_id',
  as: 'wishlistEmails',
});

module.exports = {
  Offer,
  Listing,
  ListingPhotos,
  User,
  UserActivity,
  Newsletter,
  NewsletterContact,
  Country,
  DamagedParts,
  Invoice,
  Blog,
  SavedListings,
  UserReportOptions,
  LoginCode,
  ListingSiteAInventory,
  Advert,
  ResetPasswordCode,
  WeeklyReportEmail,
  WishlistOptions,
  UserWishlistSendingOptions,
  WishlistEmail,
};
