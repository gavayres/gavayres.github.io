---
layout: page
title: About
permalink: /about/
weight: 3
---

# **About Me**

My name is *{{ site.author.name }}*,<br>
I am a data scientist with many interests but I won't tell you what they are. 
"When things go wrong and will not come right,
Though you do the best you can,
When life looks black as the hour of night,
A pint of plain is your only man.”
- Flann O'Brien

<div class="row">
{% include about/skills.html title="Programming Skills" source=site.data.programming-skills %}
{% include about/skills.html title="Other Skills" source=site.data.other-skills %}
</div>

<div class="row">
{% include about/timeline.html %}
</div>
