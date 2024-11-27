# Why another package?

During migration to vitest, there's a need to both provide common config and mocks without polluting workspace root, and establish clear boundary to import/export such configs.

This package is _meant_ to be internally consumed, thus `private: true` in package.json and not to be published.
