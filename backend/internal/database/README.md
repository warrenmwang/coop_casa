# Database README
## Last Updated: 05/19/2024

Location for overall design and high-level documentation.
In-depth documentation will exist as comments for the respective functions.

## Database Schema

### Users
- id: int, primary key
    unique user id, openID from oauth should be unique, check.
- email: string
- first name: string
- last name: string
- birthdate: string
    format MM-DD-YYYY
- joindate: string
    format something like MM-DD-YYYY:HH-MM-SS 
- avatar_img: string
    base64 encoded string
- locations: string
    stringified list of locations that they marked as being interested in
- interests: string
    stringified list of topics of interest that they are marked as things that they
    want to bond over with other people
 
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
- listing_date: string
    format something like MM-DD-YYYY:HH-MM-SS 
- name: string
    name of the property
- location: string
    location where this property resides
- num_bedrooms: int
    number of bedrooms in this property
- num_toilets: int
    number of toilets in this property
- num_showers_baths: int
    number of showers or baths in this property (count them together)
- cost_dollars: int
    cost that the list has set for this property in USD
    only the dollar portion
    would like to avoid using float, so store cents as separate quantity
    NOTE: total cost of a property is [cost_dollars + 0.01 * cost_cents]
- cost_cents: int
    remaining fractional dollar cost of the property in cents, value range [0, 1, ..., 99]
    NOTE: total cost of a property is [cost_dollars + 0.01 * cost_cents]
- description: string
    description of the property if provided 
- images: list of strings
    list of the base64 encoded images of the property provided by the lister
- misc_note: string
    any further notes made by the property lister

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