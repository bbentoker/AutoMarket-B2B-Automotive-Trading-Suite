# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

User Management
Add a update dealer staus endpoint , it will find the dealer from id , and update its status by the given status id
also modify the dealer login , if their status id is 2 or 3 do not let them login

Get all dealers , this will return all dealers(users with role id 2)

Listing Management
Get all listings, this endpoint will return all listings with status id 1

Update listing status, this will accept listing id and new status id , after updating the statuses id , also create one status update entry for storing previous and current status

Get listings based on status, this endpoint will accept a status id then return all listings with that status
