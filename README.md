#soundslike


##Models

###Songs
- Title (String)
- Artist (String)
- URL where song can be accessed (String)
- Created by (ObjectId)
- Edges ids (Array)

###Edges
- Song 1 id (ObjectId)
- Song 2 id (ObjectId)
- User ids who voted on it (Array)

##API
###Songs
####GET /api/songs (Admin)
Returns list of all songs
####GET /api/songs/:id
Returns a single song with the given id
####POST /api/songs (User)
Creates a song using the following input body structure:

```
{
    title: 'Can't Tell Me Nothing'
    artist: 'Kanye West'
    url: 'https://www.youtube.com/watch?v=E58qLXBfLrs'
}
```
####PUT /api/songs/:id (Admin)
Updates an existing song.
####DELETE /api/songs/:id (Song Owner/Admin)
Deletes an existing song.

###Edges
####GET /api/edges/ (Admin)
Returns list of all edgess

####GET /api/edges/:id
Return a specific edges relation using id

####GET /api/edges/:songId1/:songId2
Return a specific edges relation using song ids

####POST /api/edges/:songId/ (User)
Creates a song and edges relation with the specified song

####POST /api/edges/:songId1/:songId2 (User)
Creates a edges relation for the two specified songs
