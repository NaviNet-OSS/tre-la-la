# What Is This Awesomness?!

Trelala is a set of jquery plugins to extract statistics from a [Trello](http://trello.com/) kanban board. Here is some [awesome example](http://navinet.github.io/tre-la-la/tests/test.html) of how it looks like.

![Magic](http://reactiongifs.me/wp-content/uploads/2013/08/shia-labeouf-magic-gif.gif)

# Usage

## Trello Board Setup

There are a few conventions that need to be followed to be able to use Trelala with your Trello kanban board.

### Standard Columns (aka Trello Lists)

Trello board needs to contain the following columns:

- Analysis Complete
- Design (_optional_)
- Implementation
- Verification
- Release Ready
- Meta

Besides these colums, board may contain other columns as well, but only the columns above will be used to draw statistics from.

### "Meta" Column

"Meta" Column is used to store board metadata information (data that is not the actual user stories). "Meta" column needs to contain the cards with following names:

**Confidence: [your confidence level]**  
Example: `Confidence: High`

**Kickoff Date: [project/MVF kickoff date]**  
Example: `Kickoff Date: 12/31/2013`  
If kickoff date is not determined yet, the name of this card can be defined as `Kickoff Date: TBD`

**Analysis Complete Date: [date when MVF/project analysis was copleted and implementation started]**  
Example: `Analysis Complete Date: 12/31/2013`  
If this date is not determined yet, the name of this card can be defined as `Analysis Complete Date: TBD`

**Team Velocity (Points/Day): [how many story points does your team complete per day?]**  
Example: `Team Velocity (Points/Day): 1.2`  

**Release Ready Date: [date when MVF/project is projected (by the team) to be release ready]**  
Example: `Release Ready Date: 12/31/2013`  
If this date is not determined yet, the name of this card can be defined as `Release Ready Date: TBD`

**Released On: [date when MVF/project was actually released]**  
Example: `Released On: 12/31/2013`  
If this date is not determined yet, the name of this card can be defined as `Released On: TBD`

### User Story Sizing

### Private Boards and Trelala Unicorn

## Available jQuery Plugins

## Dependencies

## Example Page

[Taste the rainbow!](http://navinet.github.io/tre-la-la/tests/test.html)

# App Key

f5613f90a2a2b7b56334453aeff8f858

