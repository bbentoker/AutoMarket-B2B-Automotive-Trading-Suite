INSERT INTO statuses (name) VALUES
('Cars for Sale'),
('Reserved'),
('Offers'),
('Purchased'),
('Proforma Invoice Sent'),
('Payment Received'),
('Payment Sent'),
('Transport Booked'),
('Car Picked Up'),
('Documents Sent'),
('Car Delivered'),
('Car De-registered'),
('Deal Done'),
('No Deal'); 

INSERT INTO roles (name) VALUES ('admin'), ('dealer');

INSERT INTO user_status (name) VALUES ('Pending');
INSERT INTO user_status (name) VALUES ('Approved');
INSERT INTO user_status (name) VALUES ('Suspended');
INSERT INTO user_status (name) VALUES ('Removed'); 

INSERT INTO users (name, email, password, role_id) VALUES
('admin', 'admin@admin.com', '$2a$10$7BoaOzHeQxeJTlPvbl0Jq.XiPnOjA4LhScCMR7R.rH05qgo7LVQh.', 1);