# Database README
## Last Updated: 05/22/2024

Location for overall design and high-level documentation.
In-depth documentation will exist as comments for the respective functions.

## Database Schema

The database schema is written using types from PostgreSQL.
Most values are self-explanatory, with detailed justification for some fields provided for clarity.

Note, all user data is encrypted by the backend service before being stored to disk as an extra layer of security. Therefore, all sensitive user data will be stored as strings. Only "non-sensitive" data will be stored in their raw format, such as the row's logical primary key, created_at timestamp, and updated_at timestamp.

### `users`
- id: `serial`, primary key
    unique integer for primary key logical construct
- user_id: string
    unique user id, openID from oauth should be unique, check.
- email: string
- first_name: string
- last_name: string
- gender: string
- birthdate: `timestamp with time zone`
    format MM-DD-YYYY
- location: string
    current location 
- interests: string
    stringified list of topics of interest that they are marked as things that they
    want to bond over with other people
- created_at: `timestamp with time zone`
    timestamp of when the user first logged in / created their account
- updated_at: `timestamp with time zone`
    timestamp of when the user details were updated

### `user_avatars`
- user_id: string
- avatar_img: string
    base64 encoded string of the user's avatar
 
### Groups
- id: int, primary key
    unique group id
- create_date: string
    format something like MM-DD-YYYY:HH-MM-SS 
- owner: int
    id of a user that currently owns the group
- admins: list of ints
    i do not recall the datatypes allowed in postgresql off the top of my head
    list of user ids that have admin perms, owner is always the first in the list
- location: string
    where this group is based
- tagged_interests: string
    stringified list of topics of interests that this group focuses on (theme)
- members: list of ints
    complete list of user ids who are in this group (containing owner, admins, and regular members)
- group_img: string
    base64 encoded image that is used to represent the group

### Properties
Define the total set of properties $P$. 
This table contains the total set of properties that exist on the Coop platform.

Schema: 
- id: int, primary key
    unique property id
- property_id: string unique
    probably will be a UUID
- name: string
    name of the property
- description: string
    description of the property if provided 
- address_1: string
    address 1 string
- address_2: string
    address 2 string
- city: string
- state: string
- zipcode: string
- country: string
    for now anticipate this to just be USA ? 
- num_bedrooms: `smallint`
    value range [-32768 to +32767]
    number of bedrooms in this property
- num_toilets: `smallint`
    value range [-32768 to +32767]
    number of toilets in this property
- num_showers_baths: `smallint`
    value range [-32768 to +32767]
    number of showers or baths in this property (count them together)
- cost_dollars: `bigint`
    value range [-9223372036854775808 to +9223372036854775807]
    cost that the list has set for this property in USD
    only the dollar portion
    would like to avoid using float, so store cents as separate quantity
    NOTE: total cost of a property is [cost_dollars + 0.01 * cost_cents]
- cost_cents: int
    remaining fractional dollar cost of the property in cents, value range [0, 1, ..., 99]
    NOTE: total cost of a property is [cost_dollars + 0.01 * cost_cents]
- misc_note: string
    any further notes made by the property lister
- created_at: `timestamp with time zone`
    timestamp of when the user first logged in / created their account
- updated_at: `timestamp with time zone`
    timestamp of when the user details were updated

### `properties_images`
- id `serial primary key`
- property_id
- images: list of strings
    list of the base64 encoded images of the property provided by the lister

### Interested_Users
Define the total set of users $U$. 
Purpose of this table is to store, for each user $u_i \in U$, a set of other users $u_j \in U$ s.t. $j \ne i$ that the user $u_i$ has marked as being interested in living / connecting with.

Schema:
- id: int, primary key
- user_id: int
    the user id
- interested_users: list of ints
    the other user ids who the current user id is interested in dealing with

### Interested_Properties
Table containing the property ids that any user has marked as they are interested in.

Schema:
- id: int, primary key
- user_id: int
    the user id
- interested_properties: list of ints
    list of property ids

### Friends
Table containing the user ids that any user has become friends with.

Schema:
- id: int, primary key
- user_id: int
    the user id
- friends: list of ints
    list of user ids who are friends with the user