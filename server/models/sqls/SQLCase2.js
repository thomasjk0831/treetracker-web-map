/*
 * Search DB by trees table directly, like in the high zoom level, show trees
 * on the map;
 */

class SQLCase2{
  

  addTreeFilter(treeid){
    this.treeid = treeid;
  }

  addTreesFilter(){
    throw new Error("dedicated");
  }

  addFilterByUserId(userId){
    this.userId = userId;
  }

  addFilterByWallet(wallet){
    this.wallet = wallet;
  }

  addFilterByFlavor(flavor){
    this.flavor = flavor;
  }

  addFilterByToken(token){
    this.token = token;
  }

  addFilterByMapName(mapName){
    this.mapName = mapName;
  }

  getFilter(){
    let result = "";
    if(this.treeid){
      result += 'AND trees.id = ' + this.treeid + ' \n';
    }
    if(this.mapName){
      result += `
        AND trees.id IN(
          select distinct * from ( 
            SELECT trees.id as id from trees
              INNER JOIN (
                SELECT id FROM planter
                JOIN (
                  SELECT entity_id FROM getEntityRelationshipChildren(
                    (SELECT id FROM entity WHERE map_name = '${this.mapName}')
                  )
                ) org ON planter.organization_id = org.entity_id
              ) planter_ids
              ON trees.planter_id = planter_ids.id
          union all 
            SELECT trees.id as id from trees
              INNER JOIN (
                SELECT id FROM planter
                JOIN (
                  SELECT entity_id FROM getEntityRelationshipChildren(
                    (SELECT id FROM entity WHERE map_name = '${this.mapName}')
                  )
                ) org ON planter.organization_id = org.entity_id
              ) planter_ids
              ON trees.planter_id = planter_ids.id
          ) t1
        )
      `;
    }
    if(this.userId){
      result += "AND trees.planter_id = " + this.userId + " \n";
    }
    if(this.wallet) {
      result += "AND wallets.wallet.name = '" + this.wallet + "'"
    }
    return result;
  }

  setBounds(bounds){
    this.bounds = bounds;
  }

  getBoundingBoxQuery(){
    let result = "";
    if (this.bounds) {
      result += 'AND trees.estimated_geometric_location && ST_MakeEnvelope(' + this.bounds + ', 4326) ';
    }
    return result;
  }

  getJoinCriteria(){
    let result = "";
    if(this.flavor){
      result += "AND tree_attributes.key = 'app_flavor' AND tree_attributes.value = '" + this.flavor + "'";
    }
    if(this.token){
      result += "INNER JOIN certificates ON trees.certificate_id = certificates.id AND certificates.token = '" + this.token + "'";
    }
    return result;
  }

  getJoin(){
    let result = "";
    if(this.wallet){
      result += 'INNER JOIN wallets.token ON wallets.token.tree_id = trees.id \n';
      result += 'INNER JOIN wallets.wallet ON wallets.wallet.id = wallets.token.entity_id \n';
    }
    if(this.flavor){
      result += "INNER JOIN tree_attributes ON tree_attributes.tree_id = trees.id";
    }
    return result;
  }

  getQuery(){
    let sql = `
      /* sql case2 */
      SELECT /* DISTINCT ON(trees.id) */
      'point' AS type,
       trees.id, trees.lat, trees.lon 
      FROM trees 
      ${this.getJoin()}
      WHERE active = true 
      ${this.getBoundingBoxQuery()}
      ${this.getFilter()}
      ${this.getJoinCriteria()}
    ` 
    ;
    console.log(sql);

    const query = {
      text: sql,
      values: [],
    };
    return query;
  }
}


module.exports = SQLCase2;
