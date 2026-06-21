#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Install Ruby dependencies
bundle install

# 2. Build Vite/React frontend assets for Inertia
bundle exec vite build

# 3. Compile Rails assets (manifests, css, etc.)
bundle exec rails assets:precompile

# 4. Clean up asset files
bundle exec rails assets:clean

# 5. Run database migrations across the cloud to Neon
bundle exec rails db:migrate