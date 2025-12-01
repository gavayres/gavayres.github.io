---
title: LLM Pretraining
layout: default
published: false
use_math: true
keywords: machineLearning, LLM
date: 2025-08-27
---
For a while now, I have been meaning to clarify my understanding of the nuts and bolts of modern LLMs. To see which technical tricks are important and the context in which they are so, as well as the proposed improvements that seem to show only marginal value.

This note is broken into two sections. The first section discusses the technical aspects of training an LLM, and the second discusses data, evaluations, and interpretability.


# Technicalities
## Language Modelling
What kind of probabilistic model might we want to form to represent language? Well, a good starting point would be to consider a model which can assign mass to elements of the set of all possible finite strings formed from a given alphabet. We could call this alphabet a _vocabulary_ and the elements _tokens_. We may wish for our model to be normalised. We have some options here with how we choose to normalize the model. Our model can be locally normalized, the probabilities over the next token given some preceding tokens will sum to one. Or it can be globally normalised, the probability assigned to every sequence in the language will sum to one. Why would we prefer a locally normalised model over a globally normalised model or vice versa? They each have their own pros and cons. Locally normalised models often are not tight, that is they 'leak' some probability mass to infinite sequences. Globally normalised models require the computation of an intractable partition function. We won't go further into this for now but these two instances are with keeping in mind when we compare modelling paradigms later.

How can we learn a language model from data? To be more specific, how can we learn a locally normalized language model from data? We will consider the simplest possible case first. We have a data set of natural language, we chop up our sentences into blocks called tokens using a, well, tokenizer. We want to learn the probability of each sequence, $s=(w_1, ..., w_n)$, in our dataset by factorizing this into a set of conditional probabilities over the ordered set of tokens we now have. 

So we want to learn this: $p(s)=\prod_{t=1}^{T}p(w_t \vert w_{1},...,w_{t-1})$. The weights of our model will be trained to approximate this conditional distribution. At each time step, $t$, the model takes in a sequence of tokens, $s_{<t} = (w_1, ..., w_{t-1})$, and outputs a probability distribution over its vocabulary. The vocabulary represents the set of unique tokens in the dataset and maybe some other special tokens the language modeller wants to reserve for specific sequences or which may exist in future data sets. We get a probability distribution over our vocabulary by normlaizing the output of a linear layer over the vocabulary dimension, $p_{\theta}(w_t \vert s_{<t}) = \frac{\exp(logit_{\theta}(s_{<t}, w_{t}))}{\sum_{v\in V}\exp(logit_{\theta}(s_{<t}, v))}$. This function to the right of our equation is called a softmax. Why do we normalise using a softmax? Well, exponentials have the nice property of really amplifying our models most confident predictions. Also, the exponential ensures our logits are mapped to the range $[0, 1]$.

The loss we use to train our model is known as the cross-entropy loss, $L\_{CE}(\theta) = - \mathbb{E}\_{s \sim \mathcal{D}} \left[ \sum\_{t=1}^{T} \log p(w\_{t} \mid s\_{\lt t}) \right]$. The nice things about this loss: well behaved gradients, its minimum corresponds to the minimum of the KL divergence between the data distrbution and the models distribution, it provides the maximum likelihood estimator of the observed data. The not so nice things about this loss: computationally expensive for large vocabulary sizes, every token is treated equally.


Causal language modelling, conditioning the output of the model on a prompt. Flow matching models, diffusion language models. What would scaling look like or enable for these modelling paradigms?