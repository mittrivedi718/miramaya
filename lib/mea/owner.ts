// MEA is a single private user. Access is granted by the site-wide view gate
// (see proxy.ts and lib/site-gate.ts): once past that one shared passphrase for
// meetmit.me, there is no second login. All of MEA's workspace data therefore
// belongs to one stable owner id.
export const MEA_OWNER_ID = "mea-owner"
