"""
Simple Question Answering Engine for Legal Documents
"""

def generate_answer(question, context_chunks):
    """
    Generate an answer to a question based on context chunks.
    This is a simplified implementation that doesn't use an LLM.
    
    Args:
        question (str): The question to answer
        context_chunks (list): List of text chunks from the document
        
    Returns:
        str: The generated answer
    """
    # If there's no context, return a standard message
    if not context_chunks:
        return "I don't have enough information to answer that question."
    
    # Simple keyword matching for some common legal document questions
    question_lower = question.lower()
    
    # Look for specific information in the context
    if 'retainer fee' in question_lower or 'payment' in question_lower or 'cost' in question_lower or 'price' in question_lower:
        # Look for monetary amounts in the context
        for chunk in context_chunks:
            if '$' in chunk:
                # Find sentences containing dollar amounts
                sentences = chunk.split('.')
                for sentence in sentences:
                    if '$' in sentence:
                        return f"The document mentions: {sentence.strip()}."
        
    elif 'term' in question_lower or 'duration' in question_lower or 'period' in question_lower:
        # Look for terms related to time periods
        time_keywords = ['month', 'year', 'day', 'week', 'period', 'term']
        for chunk in context_chunks:
            sentences = chunk.split('.')
            for sentence in sentences:
                if any(keyword in sentence.lower() for keyword in time_keywords):
                    return f"Regarding the term: {sentence.strip()}."
    
    elif 'service' in question_lower or 'provide' in question_lower or 'deliver' in question_lower:
        # Look for services descriptions
        for chunk in context_chunks:
            if 'service' in chunk.lower():
                sentences = chunk.split('.')
                for sentence in sentences:
                    if 'service' in sentence.lower():
                        return f"Regarding services: {sentence.strip()}."
    
    elif 'confidential' in question_lower or 'privacy' in question_lower:
        # Look for confidentiality clauses
        for chunk in context_chunks:
            if 'confidential' in chunk.lower():
                sentences = chunk.split('.')
                for sentence in sentences:
                    if 'confidential' in sentence.lower():
                        return f"About confidentiality: {sentence.strip()}."
    
    elif 'intellectual property' in question_lower or 'ip' in question_lower or 'ownership' in question_lower:
        # Look for IP clauses
        for chunk in context_chunks:
            if 'property' in chunk.lower() or 'ownership' in chunk.lower():
                sentences = chunk.split('.')
                for sentence in sentences:
                    if 'property' in sentence.lower() or 'ownership' in sentence.lower():
                        return f"Regarding intellectual property: {sentence.strip()}."
        
    # If no specific information was found, return a general answer
    # Find the most relevant chunk by counting overlapping words
    overlap_scores = []
    question_words = set(question_lower.split())
    
    for chunk in context_chunks:
        chunk_words = set(chunk.lower().split())
        overlap = len(question_words.intersection(chunk_words))
        overlap_scores.append(overlap)
    
    if overlap_scores:
        best_chunk = context_chunks[overlap_scores.index(max(overlap_scores))]
        # Get the most relevant sentence from the best chunk
        sentences = best_chunk.split('.')
        best_sentence_score = 0
        best_sentence = ""
        
        for sentence in sentences:
            if len(sentence) < 10:  # Skip very short sentences
                continue
            sentence_words = set(sentence.lower().split())
            overlap = len(question_words.intersection(sentence_words))
            if overlap > best_sentence_score:
                best_sentence_score = overlap
                best_sentence = sentence
        
        if best_sentence:
            return f"Based on the document: {best_sentence.strip()}."

    # Fallback answer
    return "I found some relevant information in the document but couldn't determine a specific answer to your question." 