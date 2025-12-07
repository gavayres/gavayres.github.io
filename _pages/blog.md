---
permalink: /blog/
title: Blog
layout: default
---
<div id='blog' class='wrap'>
    <div id='intro'>
        <div class='quote'>
            <p>You do not need a license to drive a sandwich.</p>
            <b>- Spongebob Squarepants</b>
        </div>
    </div>
    <div id='posts' class='section'>
        {% for post in site.posts %}
            <div class='post-row'>
                <p class='post-title'>
                    <a href="{{ post.url }}">
                        {{ post.title }}
                    </a>
                </p>
                <p class='post-date'>
                    {{ post.date | date_to_long_string }}
                </p>
            </div>
            <p class='post-subtitle'>
                {{ post.subtitle }}
            </p>
            <span class='hidden'>{{ forloop.index }}</span>
        {% endfor %}
    </div>
</div>
