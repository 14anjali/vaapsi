# lib/store/

Zustand stores for ephemeral client state.

The rule: if it would still matter after a refresh, it does not belong here.
Filter state goes in the URL. Cart contents come from the data adapter. What
lives here is which drawer is open.
