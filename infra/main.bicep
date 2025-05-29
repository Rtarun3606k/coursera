// Main Bicep file for Coursera-like app with Azure Cosmos DB (MongoDB API)
targetScope = 'resourceGroup'

@minLength(1)
@maxLength(64)
@description('Name of the environment used to generate a short unique hash for resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Name of the resource group')
param resourceGroupName string = ''

@description('NextAuth URL for the application')
param nextAuthUrl string

@description('NextAuth secret for session encryption')
@secure()
param nextAuthSecret string

@description('Google OAuth Client ID')
@secure()
param authGoogleId string

@description('Google OAuth Client Secret')
@secure()
param authGoogleSecret string

// Generate a unique suffix for resource names
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = {
  'azd-env-name': environmentName
}

// Define core resources
module cosmosDb 'modules/cosmosdb.bicep' = {
  name: 'cosmosdb'
  params: {
    location: location
    tags: tags
    resourceToken: resourceToken
  }
}

module keyVault 'modules/keyvault.bicep' = {
  name: 'keyvault'
  params: {
    location: location
    tags: tags
    resourceToken: resourceToken
    principalId: appService.outputs.identityPrincipalId
  }
}

module logAnalytics 'modules/loganalytics.bicep' = {
  name: 'loganalytics'
  params: {
    location: location
    tags: tags
    resourceToken: resourceToken
  }
}

module appInsights 'modules/appinsights.bicep' = {
  name: 'appinsights'
  params: {
    location: location
    tags: tags
    resourceToken: resourceToken
    logAnalyticsWorkspaceId: logAnalytics.outputs.id
  }
}

module appServicePlan 'modules/appserviceplan.bicep' = {
  name: 'appserviceplan'
  params: {
    location: location
    tags: tags
    resourceToken: resourceToken
  }
}

module appService 'modules/appservice.bicep' = {
  name: 'appservice'
  params: {
    location: location
    tags: tags
    resourceToken: resourceToken
    appServicePlanId: appServicePlan.outputs.id
    cosmosDbConnectionString: cosmosDb.outputs.connectionString
    keyVaultName: keyVault.outputs.name
    appInsightsConnectionString: appInsights.outputs.connectionString
    nextAuthUrl: nextAuthUrl
    nextAuthSecret: nextAuthSecret
    authGoogleId: authGoogleId
    authGoogleSecret: authGoogleSecret
  }
}

// Store secrets in Key Vault
module keyVaultSecrets 'modules/keyvault-secrets.bicep' = {
  name: 'keyvault-secrets'
  params: {
    keyVaultName: keyVault.outputs.name
    secrets: [
      {
        name: 'DATABASE-URL'
        value: cosmosDb.outputs.connectionString
      }
      {
        name: 'NEXTAUTH-SECRET'
        value: nextAuthSecret
      }
      {
        name: 'AUTH-GOOGLE-ID'
        value: authGoogleId
      }
      {
        name: 'AUTH-GOOGLE-SECRET'
        value: authGoogleSecret
      }
    ]
  }
  dependsOn: [
    appService
  ]
}

// Outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_KEY_VAULT_NAME string = keyVault.outputs.name
output SERVICE_COURSERA_ENDPOINT_URL string = appService.outputs.uri
output COSMOS_DB_ENDPOINT string = cosmosDb.outputs.endpoint
output COSMOS_DB_DATABASE_NAME string = cosmosDb.outputs.databaseName
