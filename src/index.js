const Client = require('cwcc-provision-client')
require('dotenv').config()

const client = new Client({
  fromAddress: process.env.FROM_ADDRESS,
  apiKey: process.env.API_KEY,
  tenantId: process.env.TENANT_ID
})

const userTemplate = require('./templates/user')
const teamTemplate = require('./templates/team')
const virtualTeamTemplate = require('./templates/virtual-team')
const routingStrategyTemplate = require('./templates/routing-strategy')

async function getOrCreateTeam (teamName) {
  console.log('getOrCreateTeam', teamName)
  // find existing team
  let existingTeam

  try {
    const response = await client.team.list()
    // console.log(response)
    const summary = response.auxiliaryDataList.map(v => {
      return {
        id: v.id,
        name: v.attributes.name__s
      }
    })
    console.log('found', response.auxiliaryDataList.length, 'existing teams. Searching for', teamName, '...')
    const teams = response.auxiliaryDataList
    // find specific team
    let existingTeam = teams.find(v => v.attributes.name__s === teamName)
    if (existingTeam) {
      console.log('found existing team', teamName, ':', existingTeam.id, ':', existingTeam.attributes.dbId__l)
      return existingTeam
    } else {
      // no existing team
      console.log('team', teamName, 'not found. Creating team...')
    }
  } catch (e) {
    console.log('Failed to find existing team', teamName, ':', e.message)
    throw e
  }

  // team not found - create new team
  let teamId
  try {
    // build team body
    const body = teamTemplate({name: teamName})
    // create team
    const response = await client.team.create(body)
    // extract new object ID from response
    teamId = response[0].links[0].href.split('/').pop()
    // log
    console.log('successfully created new team', teamName, ':', teamId)
  } catch (e) {
    console.log('Failed to create team', teamName, ':', e.message)
    throw e
  }

  // retrieve newly created team details
  try {
    console.log('retrieving new team', teamName, ':', teamId, '...')
    // get team
    const team = await client.team.get(teamId)
    console.log('returning new team', teamName, ':', teamId, ':', team.attributes.dbId__l)
    // return team
    return team
  } catch (e) {
    console.log('Failed to get new team', teamName, ':', e.message)
    throw e
  }
}

async function getOrCreateUser (username, teamId) {
  console.log('getOrCreateUser', username, teamId)
  // find existing user
  try {
    console.log('looking for existing user', username, '...')
    const response = await client.user.getByLogin(username)
    if (response.auxiliaryMetadata.numberOfRecords === 0) {
      // 0 records
      console.log('no existing user found matching username', username)
      // continue after this try block
    } else if (response.auxiliaryMetadata.numberOfRecords === 1) {
      // 1 record
      const existingUser = response.auxiliaryDataList[0]
      console.log('found existing user', username, ':', existingUser.id)
      // console.log(JSON.stringify(existingUser, null, 2))
      return existingUser
    } else {
      // more than 1
      console.log('found more than one user record:', response)
      // cannot continue
      throw Error('Found ' + response.auxiliaryMetadata.numberOfRecords + ' users. Cannot continue provision.')
    }
  } catch (e) {
    console.log('Failed while trying to find existing user', username, ':', e.message)
    throw e
  }

  // create new user
  let userId
  try {
    console.log('creating new user', username, '...')
    // create user template
    const body = userTemplate({
      username,
      teamId
    })
    console.log('user template:', body)
    // create user
    const response = await client.user.create(body)
    console.log('successfully created new user', username, ':', JSON.stringify(response, null, 2))
    // return user response? check the logs on the next one to extract user ID
    return response
    // extract user ID
    // userId = response[0].links[0].href.split('/').pop()
    // console.log('Successfully created new user', username, ':', userId)
  } catch (e) {
    console.log('Failed to create new user', username, ':', e.message)
    throw e
  }

  // retrieve newly created user details
  try {
    console.log('retrieving new user', username, ':', userId, '...')
    // get user
    const user = await client.user.get(userId)
    console.log('returning new user', username, ':', userId)
    // return user
    return user
  } catch (e) {
    console.log('Failed to get user', username, ':', e.message)
    throw e
  }
}

async function getOrCreateVirtualTeam (name) {
  console.log('getOrCreateVirtualTeam', name)

  // find existing virtual team
  try {
    const response = await client.virtualTeam.list()
    const summary = response.auxiliaryDataList.map(v => {
      return {
        id: v.id,
        name: v.attributes.name__s
      }
    })
    console.log('found', response.auxiliaryDataList.length, 'existing virtual teams. Searching for', name, '...')
    const virtualTeams = response.auxiliaryDataList
    // find specific virtual team
    const existingVirtualTeam = virtualTeams.find(v => v.attributes.name__s === name)
    if (existingVirtualTeam) {
      console.log('found existing virtual team', name, ':', existingVirtualTeam.id, ':', existingVirtualTeam.attributes.dbId__l)
      return existingVirtualTeam
    } else {
      // no existing virtual team
      console.log('virtual team', name, 'not found. Creating virtual team...')
    }
  } catch (e) {
    console.log('Failed to find existing virtual team', name, ':', e.message)
    throw e
  }

  // create new virtual team
  let virtualTeamId
  try {
    console.log('creating new virtual team', name, '...')
    // create virtual team template
    const body = virtualTeamTemplate({name})
    console.log('virtual team template:', body)
    // create virtual team
    const response = await client.virtualTeam.create(body)
    // check HTTP status inside the response
    if (response[0].code < 200 || response[0].code >= 300) {
      console.log('Failed to create new virtual team - status code', response[0].code, response[0])
      // HTTP error code
      throw Error('Failed to create new virtual team - status code ' + response[0].code, response[0])
    }
    console.log('successfully created new virtual team', name, ':', JSON.stringify(response, null, 2))
    // extract virtual team ID
    virtualTeamId = response[0].links[0].href.split('/').pop()
    console.log('Successfully created new virtual team', name, ':', virtualTeamId)
  } catch (e) {
    console.log('Failed to create new virtual team', name, ':', e.message)
    throw e
  }

  // retrieve newly created virtual team details
  try {
    console.log('retrieving new virtual team', name, ':', virtualTeamId, '...')
    // get virtualTeam
    const virtualTeam = await client.virtualTeam.get(virtualTeamId)
    console.log('returning new virtual team', name, ':', virtualTeamId, ':')
    // return virtualTeam
    return virtualTeam
  } catch (e) {
    console.log('Failed to get virtual team', name, ':', e.message)
    throw e
  }
}

async function getOrCreateRoutingStrategy ({
  name,
  virtualTeamId,
  virtualTeamDbId,
  virtualTeamName,
  teamId,
  teamName
}) {
  console.log('getOrCreateRoutingStrategy', arguments[0])

  // find existing routing strategy
  try {
    const response = await client.routingStrategy.list()
    const summary = response.auxiliaryDataList.map(v => {
      return {
        id: v.id,
        name: v.attributes.name__s
      }
    })
    console.log('found', response.auxiliaryDataList.length, 'existing routing strategies. Searching for', name, '...')
    const items = response.auxiliaryDataList
    // find specific item
    const existing = items.find(v => v.attributes.name__s === name)
    if (existing) {
      console.log('found existing routing strategy', name, ':', existing.id, ':')
      return existing
    } else {
      // no existing
      console.log('routing strategy', name, 'not found. Creating new...')
    }
  } catch (e) {
    console.log('Failed while searching for existing routing strategy', name, ':', e.message)
    throw e
  }

  // create new
  let id
  let currentRsId
  try {
    console.log('creating new routing strategy', name, '...')
    // build from template
    const body = routingStrategyTemplate({
      name,
      virtualTeamId,
      virtualTeamDbId,
      virtualTeamName,
      teamId,
      teamName
    })
    console.log('routing strategy template:', body)
    // create new
    const response = await client.routingStrategy.create(body)
    // console.log('successfully created new routing strategy', name, ':', JSON.stringify(response, null, 2))
    // extract routing strategy ID
    id = response[0].links[0].href.split('/').pop()
    console.log('Successfully created new routing strategy', name, ':', id)
    // now build current routing strategy with almost the same body
    console.log('creating new current routing strategy for today...')
    // set current RS name
    body[0].attributes.name__s = 'Current-' + body[0].attributes.name__s
    // set current status to true
    body[0].attributes.currentStatus__i = 1
    // set parent routing strategy ID
    body[0].attributes.parentStrategyId__s = id
    // create current RS
    const response2 = await client.routingStrategy.create(body)
    currentRsId = response2[0].links[0].href.split('/').pop()
    console.log('successfully created new current routing strategy', body[0].attributes.name__s, ':', currentRsId)
  } catch (e) {
    console.log('Failed to create new routing strategy', name, ':', e.message)
    throw e
  }

  // retrieve newly created routing strategy details
  try {
    console.log('retrieving new routing strategy', name, ':', id, '...')
    // get
    const item = await client.routingStrategy.get(id)
    console.log('details for new routing strategy retrieved successfully.')
    console.log('returning new routing strategy', name, ':', id)
    // return item
    return item
  } catch (e) {
    console.log('Failed to get routing strategy', name, ':', e.message)
    throw e
  }
}

// define async function block
async function go (dCloudUserId) {
  const teamName = 'T_dCloud_' + dCloudUserId
  const username = 'rbarrows' + dCloudUserId + '@dcloud.cisco.com'
  const virtualTeamName = 'Q_dCloud_' + dCloudUserId
  const routingStrategyName = 'RS_dCloud_' + dCloudUserId

  const team = await getOrCreateTeam(teamName)
  const user = await getOrCreateUser(username, team.id)
  const virtualTeam = await getOrCreateVirtualTeam(virtualTeamName)
  const routingStrategy = await getOrCreateRoutingStrategy({
    name: routingStrategyName,
    virtualTeamId: virtualTeam.id,
    virtualTeamName,
    virtualTeamDbId: virtualTeam.attributes.dbId__l,
    teamName,
    teamId: team.attributes.dbId__l
  })
}

// run async
go('0325').catch(e => console.log(e.message))
