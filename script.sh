#!/bin/bash

# Color codes
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

##########################################################
# Prompt the user for the API token
##########################################################
echo -ne "${YELLOW}Enter your API token: ${NC}"
read API_TOKEN

RESPONSE=$(curl -s -u platform-api-user: \
  -d "grant_type=api_token&api_token=$API_TOKEN" \
  https://auth.api.platform.sh/oauth2/token)

ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to retrieve access token"
  echo "Response: $RESPONSE"
  exit 1
fi

echo -ne "${GREEN}Access Token:${NC} $ACCESS_TOKEN\n"

##########################################################
# Check user phone verification
##########################################################
echo -ne "${YELLOW}Checking if your profile meet the requirement${NC}\n"

# Check if user phone is verified
PHONE_RESPONSE=$(curl -s --location --request POST 'https://api.upsun.com/me/phone' \
  --header "Content-Type: application/json" \
  --header "Accept: application/json" \
  --header "Authorization: Bearer $ACCESS_TOKEN")

VERIFY_PHONE=$(echo "$PHONE_RESPONSE" | jq -r '.verify_phone')

if [ "$VERIFY_PHONE" == "true" ]; then
  echo -ne "${RED}You need to verify your user phone${NC}\n"
  exit 1
fi

echo -ne "${GREEN}All good !${NC}\n"

# Prompt the user for the owner ID
echo -ne "${YELLOW}Enter the owner ID: ${NC}"
read OWNER_ID

##########################################################
# Create a new organisation or use Akeneo POC organisation
##########################################################
echo -ne "${YELLOW}Do you want to create a new organisation (y) or use Akeneo POC (n) ? (y/n): ${NC}"
read ANSWER
echo

ANSWER=$(echo "$ANSWER" | tr '[:upper:]' '[:lower:]')
if [[ "$ANSWER" == "y" || "$ANSWER" == "yes" ]]; then
  
  ##########################################################
  # User want to create a new organisation
  ##########################################################

  # Prompt the user for the organization name
  echo -ne "${YELLOW}Enter the name of the organisation (name must be lowercase, no space, no dash): ${NC}"
  read ORG_NAME

  if [ -z "$API_TOKEN" ] || [ -z "$OWNER_ID" ] || [ -z "$ORG_NAME" ]; then
    echo "API token / owner ID / org name cannot be empty."
    exit 1
  fi

  # POST request to create the organization
  ORG_RESPONSE=$(curl -s --location --request POST 'https://api.upsun.com/organizations' \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Authorization: Bearer $ACCESS_TOKEN" \
    --data-raw "{
      \"label\": \"$ORG_NAME\",
      \"owner_id\": \"$OWNER_ID\",
      \"name\": \"$ORG_NAME\",
      \"country\": \"FR\"
    }")

  # Extract and display the organization ID
  ORG_ID=$(echo "$ORG_RESPONSE" | jq -r '.id')

  if [ "$ORG_ID" == "null" ] || [ -z "$ORG_ID" ]; then
    echo "Failed to create organization"
    echo "Response: $ORG_RESPONSE"
    exit 1
  fi

  echo -ne "${GREEN}SUCCESS ! organisation ID: $ORG_ID ${NC}\n"
  echo -ne "${YELLOW}Scirpt will stop now, you cannot go further without using the Akeneo organisation ${NC}"
  exit 1

else

  ##########################################################
  # User want to use Akeneo organisation
  ##########################################################

  echo -e "${GREEN}You chose to use Akeneo, good choice !.${NC}"
  ORG_ID="01JQBGXYH8WM53PZ9J1W8QYQ7H"

fi

##########################################################
# Create a new project
##########################################################

# Prompt for project title
echo -ne "${YELLOW}Enter your project title: ${NC}"
read PROJECT_TITLE

# Prompt for default branch
echo -ne "${YELLOW}Enter default branch (main or master): ${NC}"
read DEFAULT_BRANCH

# Validate project input
if [ -z "$PROJECT_TITLE" ] || [ -z "$DEFAULT_BRANCH" ]; then
  echo "Project title and default branch cannot be empty."
  exit 1
fi

# Refresh the access token
RESPONSE=$(curl -s -u platform-api-user: \
  -d "grant_type=api_token&api_token=$API_TOKEN" \
  https://auth.api.platform.sh/oauth2/token)

ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to retrieve access token"
  echo "Response: $RESPONSE"
  exit 1
fi

# Make the POST request to create the subscription
SUB_RESPONSE=$(curl -s --location "https://api.upsun.com/organizations/$ORG_ID/subscriptions" \
  --header "Content-Type: application/json" \
  --header "Accept: application/json" \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --data "{
    \"project_region\": \"fr-3.platform.sh\",
    \"project_title\": \"$PROJECT_TITLE\",
    \"options_url\": \"\",
    \"options_custom\": {},
    \"default_branch\": \"$DEFAULT_BRANCH\",
    \"environments\": 3,
    \"storage\": 5120
  }")


PROJECT_ID=$(echo "$RESPONSE" | jq -r '.activities[0].payload.project.id')
if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
  echo -ne "${RED}Failed to create project ${NC}"
  echo -ne "Response: $SUB_RESPONSE"
  exit 1
fi

# Optional: Print the full response or extract project ID if needed
echo -ne "${GREEN}Subscription creation response: ${NC}"
echo -ne "$SUB_RESPONSE"

echo -ne "Project ID: $PROJECT_ID"

##########################################################
# Create a new github integration
##########################################################

# Prompt for project title
echo -ne "${YELLOW}Enter your repository name: ${NC}"
read REPOSITORY_NAME

# Prompt for default branch
echo -ne "${YELLOW}Enter your repository token: ${NC}"
read REPOSITORY_TOKEN

# Validate project input
if [ -z "$REPOSITORY_NAME" ] || [ -z "$REPOSITORY_TOKEN" ]; then
  echo "Repository name and token cannot be empty."
  exit 1
fi

# Add GitHub integration
INT_RESPONSE=$(curl --location "https://api.upsun.com/projects/$PROJECT_ID/integrations" \
--header "Content-Type: application/json" \
--header "Accept: application/json" \
--header "Authorization: Bearer $ACCESS_TOKEN"  \
--data "{
	"type": "GitHub",
	"fetch_branches": true,
	"prune_branches": true,
	"environment_init_resources": "parent",
	"token": "$REPOSITORY_TOKEN",
	//"base_url": "string", not needed for this case
	"repository": "$REPOSITORY_NAME",
	"build_pull_requests": true,
	"build_draft_pull_requests": true,
	"build_pull_requests_post_merge": true,
	"pull_requests_clone_parent_data": true
}")

# Optional: Print the full response or extract project ID if needed
echo -ne "${GREEN}Integration creation response: ${NC}"
echo -ne "$INT_RESPONSE"

##########################################################
# Create a admin user invitation to the organization
##########################################################

# Prompt the user eamil
echo -ne "${YELLOW}Enter the admin email: ${NC}"
read ADMIN_EMAIL

$ORG_ID

INVIT_RESPONSE=$(curl --location "https://api.platform.sh/organizations/$ORG_ID/invitations" \
--header "Content-Type: application/json" \
--header "Accept: application/json" \
--header "Authorization: Bearer $API_TOKEN" \
--data-raw "{
  "email": "$ADMIN_EMAIL",
  "permissions": [
    "admin"
  ],
  "force": true
}")

"state": "pending",

$ADMIN_EMAIL=$(echo "$INVIT_RESPONSE" | jq -r '.email')
if [ "$ADMIN_EMAIL" == "null" ] || [ -z "$ADMIN_EMAIL" ]; then
  echo -ne "${RED}Failed to send invitation ${NC}"
  echo -ne "Response: $SUB_RESPONSE"
  exit 1
fi

# Optional: Print the full response or extract project ID if needed
echo -ne "${GREEN}Invitation sent to $ADMIN_EMAIL${NC}"
echo -ne "$INT_RESPONSE"