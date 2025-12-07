---
permalink: /notes/
title: Notes
layout: default
---
<div id='notes' class='wrap'>
    <div id='intro'>
        <div class='quote'>
            <p>"Your talk," I said, "is surely the handiwork of wisdom because not one word of it do I understand."</p>
            <b>- Flann O'Brien</b>
        </div>
    </div>
    <div id='study-notes' class='section'>
        {% for note in site.notes %}
            <div class='note-row'>
                <p class='note-title'>
                    <a href="{{ note.url }}">
                        {{ note.title }}
                    </a>
                </p>
                <p class='note-date'>
                    {{ note.date | date_to_long_string }}
                </p>
            </div>
            <p class='note-subtitle'>
                {{ note.subtitle }}
            </p>
            <span class='hidden'>{{ forloop.index }}</span>
            {% endfor %}
    </div>
</div>
