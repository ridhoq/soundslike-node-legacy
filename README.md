#soundslike


##Models

###Songs
- Title (String)
- Artist (String)
- URL where song can be accessed (String)
- Created by (ObjectId)
- Soundslike ids (Array)

###Soundslike
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

###Soundslike
####GET /api/soundslike/ (Admin)
Returns list of all Soundslikes

####GET /api/soundslike/:id
Return a specific Soundslike relation using id

####GET /api/soundslike/:songId1/:songId2
Return a specific Soundslike relation using song ids

####POST /api/soundslike/:songId/ (User)
Creates a song and Soundslike relation with the specified song

####POST /api/soundslike/:songId1/:songId2 (User)
Creates a Soundslike relation for the two specified songs
