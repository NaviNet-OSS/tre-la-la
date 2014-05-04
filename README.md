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

To do calculaitons of estimated target date and progress, cards on the board need to have size assigned to them. As a convention, each card can have the size of either **Small**, **Medium** or **Large**. Each size represents certain amount of points - those points are used to do estimation and progress calculation (taking points/day team velocity to consideration). The weight (in points) of each size is as follows:

- Small - 1 point
- Medium - 2 points
- Large - 4 points

#### Card Naming

To assign a specific size to a card just append [S] (for Small), [M] (for Medium) or [L] (for Large) to the beginning of each card name, eg. _"Feature X" -> "[S] Feature X"_.

### Private Boards and Trelala Unicorn

In case your Trello board is not public, you will need to add Trello user "Trelala Unicorn" to the list of members to your board (having at least READ permission), so that Trelaal would have access to board data.

## Available jQuery Plugins

`.trelalaBoardDashboardSummary(boardId)` provides dashboard summary of your board.

`.trelalaBoardSummary(boardId)` provides expanded summary of your board.

`.trelalaBoardScopeChangeHistory(boardId)` generates a table with the history (card additions and removals) of your board since **Analysis Complete Date**.

`.trelalaBoardCfd(boardId)` generates Cumulative Flow Diagram for your board.

`.trelalaBoardFrequencyChard(boardId)` (I'm sure the misspelling was intentional) generates the Cycle Time Chart for your board.

## Dependencies

Besides the `tre-la-la.js` reference on the page, below is the list of javascript dependencies required to run Trelala:

    <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
    <script src="http://momentjs.com/downloads/moment.min.js"></script>
    <script src="https://api.trello.com/1/client.js?key=f5613f90a2a2b7b56334453aeff8f858"></script>
    <script src="http://code.highcharts.com/highcharts.js"></script>

## Example Page

[Taste the rainbow!](http://navinet.github.io/tre-la-la/tests/test.html)

# App Key

f5613f90a2a2b7b56334453aeff8f858

