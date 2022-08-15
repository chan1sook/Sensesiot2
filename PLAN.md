# DB Structure

- user
  - firebase auth
    [x] email
    [x] gmail
  - product-info
- payment/transaction

- sensesiot
  - promotions?
  - userinfo
    [x] uid
    [x] credit
    [x] packages, extensions
  - log (timeseries with ttl)
  - widget-template
  - dashboard
    - id
    - widgets
      - type
      - used-credit (calculated?)
      - position
      - data-channel
      - condition (blockly, bg worker)
      - etc.
  - themes?
  - api-token

# Backend

- manage
  - sensesiot
    - basic-config?
    - themes
    - widget-template
    - promotions?
    - packages
    - users
      - manual set packages?

# Test capacity

- Environment : test/production

  - separate

- VM
  - split test/production (same server?)
