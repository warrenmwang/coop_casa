# SQL Database

## Last Updated: 08/03/2024

Location for overall design and high-level documentation.
In-depth documentation will exist as comments for the respective functions.

The database schema is written using types from PostgreSQL.
Most values are self-explanatory, with detailed justification for some fields provided for clarity.

Note, all user data is encrypted by the backend service before being stored to disk as an extra layer of security. Therefore, all sensitive user data will be stored as strings. Only "non-sensitive" data will be stored in their raw format, such as the row's logical primary key, created_at timestamp, and updated_at timestamp.

Documentation about the schemas and queries design is WIP.
