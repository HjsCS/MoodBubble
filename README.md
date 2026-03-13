
# MoodBubble — Project Outline

## 1. Project Description

**MoodBubble** is a map-based emotional journaling platform that allows users to record their feelings at specific locations and visualize their emotional memories across places and time.

Instead of a traditional diary, MoodBubble transforms emotions into **spatial experiences**. Each emotional entry is attached to a location on the map, allowing users to see where their happiest, calmest, or most stressful moments occurred.

Over time, the platform builds a **visual emotional landscape**, helping users reflect on how different places influence their well-being.

MoodBubble also provides **data visualization and emotional insights**, allowing users to identify emotional hotspots, mood trends, and patterns connected to specific places.

The platform encourages reflection by reminding users of past emotional moments when they revisit places, turning everyday locations into meaningful emotional memories.

---

# 2. Core Concept

MoodBubble records **intentional emotional posts tied to specific locations**.

Instead of tracking movement continuously, the system focuses on **user-generated emotional memories**.

Each time a user records an emotional entry at a location:

- the place becomes part of the user's **personal emotional map**
- the surrounding map area gradually becomes **illuminated**
- emotional influence is visualized through **bubble-shaped clusters**

Repeated emotional entries in the same area increase the bubble size, visually representing how strongly that place is connected to the user's emotional experiences.

Over time, the map evolves into a **bubble-like emotional landscape**, where larger bubbles represent locations with stronger emotional significance.

---

# 3. Core Features

## 3.1 Map-Based Emotional Posts

Users can create an emotional entry at a specific location.

Each entry contains:

- location (GPS or selected on map)
- emotion score (scale not finalized yet — numerical scale used in examples only)
- emotion category
- optional photo
- optional video
- optional text note
- visibility setting (private / friends)

The entry appears as a **bubble marker on the map**.

Example entry:

```
Location: Carlton Gardens
Emotion Score: example value
Category: Social / Friends
Note: Had coffee with friends and felt relaxed
Media: photo or video
Visibility: private
```

---

## 3.2 Emotion Categories

To better capture different types of emotional experiences, emotions are categorized similarly to **expense categories in finance tracking apps**.

Example categories include:

- Food & Dining
- Nature / Scenery
- Social / Friends
- Work / Study
- Relaxation
- Travel / Exploration
- Health & Exercise
- Environment / Sustainability
- Entertainment / Gaming
- Other

These categories help users analyze patterns in their emotional life, such as:

- which environments bring the most happiness
- what activities are associated with positive or negative moods
- how different aspects of daily life affect emotional well-being

---

## 3.3 Bubble-Based Emotional Visualization

MoodBubble uses **bubble visualization** to represent emotional activity.

Each location on the map is represented by a bubble:

- **bubble color** reflects emotional tone
- **bubble size** reflects number of emotional posts
- **bubble position** corresponds to location

Emotion values are mapped onto a color gradient.

Example (illustrative only):

```
low emotion score → red tones
medium emotion score → yellow tones
high emotion score → green tones
```

Actual scoring scale is **not yet finalized**.

---

## 3.4 Emotional Bubble Clusters

To prevent misleading averages, emotional entries are grouped into **bubble clusters**.

Clusters represent:

- groups of emotional posts in the same area
- bubble size reflects number of entries
- bubble color reflects emotional tone

Example:

```
Cluster A
Color: green
Size: large
Meaning: many positive experiences here

Cluster B
Color: red
Size: small
Meaning: fewer negative experiences
```

This ensures that locations with many emotional memories appear more significant than places with only a few posts.

---

## 3.5 Bubble Expansion Mechanism

Each emotional post gradually expands the bubble in that location.

Example logic:

```
1 post → small bubble
3 posts → medium bubble
10 posts → large bubble
```

This visually represents how repeated experiences strengthen the emotional significance of a location.

Over time, users build a **map filled with emotional bubbles representing their memories**.

---

## 3.6 Emotional Timeline Filters

Users can filter the map based on time ranges:

- today
- last 7 days
- last month
- custom range

This allows users to observe emotional patterns over time.

Example:

```
This week:
University area mostly neutral

Last month:
Park area mostly positive
```

---

## 3.7 Emotional Post Details

Clicking on a bubble or cluster reveals the individual emotional entries.

Entry details may include:

- photo or video
- note
- timestamp
- emotion score
- category

Example view:

```
Carlton Gardens

Entry 1
Category: Social
Note: Coffee with friends

Entry 2
Category: Relaxation
Note: Quiet walk after class
```

---

## 3.8 Location-Based Memory Reminders

When users return to a location where they previously recorded emotional entries, the system may display a reminder such as:

```
3 months ago at this location:
You recorded a happy moment here.

Entry:
"Celebrated finishing exams with friends."
```

These reminders help users rediscover emotional moments they may have forgotten.

---

## 3.9 Map Visibility Modes

MoodBubble supports different map visibility levels.

### Private Map

Shows only the user's personal emotional entries and insights.

This map builds a long-term personal emotional history.

---

### Friends Map

Displays emotional posts shared by friends.

Features:

- shows friends' emotional posts
- posts remain visible for **24 hours**
- older entries disappear automatically

Example:

```
Mike
Location: Melbourne CBD
Mood: excited
Note: Just finished a great project presentation
```

The Friends Map provides a lightweight social layer where users can see recent moods of friends without long-term storage.

---

# 4. Data Visualization and Insights

MoodBubble provides personal insights based on recorded data.

### Emotional hotspots

```
Happiest place:
Carlton Gardens

Most stressful place:
Exam hall
```

---

### Emotion distribution

Example visualization:

```
Positive: 55%
Neutral: 30%
Negative: 15%
```

---

### Category-based analysis

```
Food & Dining → high positive trend
Study / Work → moderate mood
Nature → strongest positive trend
```

---

### Location-based emotion analysis

```
University
Average mood: moderate

Home
Average mood: high
```

---

### Time-based mood trends

```
Weekdays → neutral
Weekends → more positive
```

---

### Personal recap

Example summary:

```
Summer Recap

You explored 14 locations
Your happiest place: St Kilda Beach
Most emotional memories: Carlton
Overall mood trend: positive
```

---

# 5. User Interaction Flow

### Step 1

User opens the application.

The interface displays a **map centered around the user's location**.

---

### Step 2

User selects **Add Mood Entry**.

---

### Step 3

User records an entry:

- select emotion score
- select category
- add note
- upload photo or video
- choose visibility (private / friends)

---

### Step 4

The entry appears as a **bubble on the map**.

The bubble grows as more emotional entries are added.

---

### Step 5

Over time, multiple entries create emotional bubble clusters and visual patterns.

Users can switch between:

- Private Map
- Friends Map

---

# 6. Technical Architecture

Frontend

[To be determined]

Backend

[To be determined]

Database

[To be determined]

Map Service

[To be determined]

Data Visualization

[To be determined]

---

# 7. MVP Scope (48-hour Hackathon)

### Must Have

Map interface  
Create emotional entry  
Emotion categories  
Bubble-based markers  
Photo/video upload  
Basic color gradient visualization  
Entry detail view  
Private map mode  
Friends map mode (24-hour entries)

---

### Nice to Have

Bubble clustering  
Bubble expansion visualization  
Location-based memory reminders  
Timeline filters  
Personal emotion insights  
Recap summary page

---

# 8. Future Extensions

Possible improvements after MVP:

- mobile app version
- AI-generated emotional insights
- automatic location detection
- deeper emotional analytics
- yearly emotional memory reports
- city-wide emotional trends

---

# Project Summary

MoodBubble transforms everyday emotions into a living map of memories, allowing users to visualize how places shape their feelings and experiences over time.
