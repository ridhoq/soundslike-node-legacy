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
####PUT /api/songs/:id (User)
Updates an existing song. Must send ALL fields (see POST) not just the fields being updated.

####DELETE /api/songs/:id (Admin)
Deletes an existing song.