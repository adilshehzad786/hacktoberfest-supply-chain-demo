This teaching PR replaces a local dependency archive while preserving its package name, version, and reviewed lockfile. The authored replacement changes the generated page and copies a fixed fake token into a local evidence file during installation.

Compare the two paths in **Attack then prevention**:

- **Unsafe install · teaching only** is expected to finish green while producing the changed page and capture evidence.
- **Protected install** is expected to fail with an integrity mismatch before the dependency hook or page build.

Open the job summaries and downloaded HTML artifacts to inspect what happened. A red protected check is the intended result only when its evidence confirms the integrity rejection.

This is a public training example. It uses authored fixtures, no real credentials, no network receiver, and no cloud deployment. Keep this PR unmerged as the attack example. A separately prepared fix restores the reviewed package bytes.
