def get_all_variations(all_characters):
    # Define the mapping of ambiguous letters
    reference = {
        'क़': 'क', 'ख़': 'ख', 'ग़': 'ग', 'ज़': 'ज', 'क': 'क़', 'ख': 'ख़', 'ग': 'ग़', 'ज': 'ज़', 
    }

    # Identify critical points where variations are needed
    critical_points = {}
    for i, char in enumerate(all_characters):
        if char in reference:
            # Populate critical points with possible replacements
            critical_points[i] = reference[char]

    # Generate all variations
    variations = [all_characters[:]]  # Start with the original list

    for idx, replacement in critical_points.items():
        new_variations = []
        for variation in variations:
                # Create a new variation with the replacement
                new_variation = variation[:]
                new_variation[idx] = replacement
                new_variations.append(new_variation)
        variations.extend(new_variations)
    variations = [''.join(variation) for variation in variations]
    return variations

    # Join each variation into a single string and return
    # return as a set to remove duplicates

# Example usage
all_characters = ['क़', 'ख', 'A', 'ज़', 'B']  # Replace with actual data
variations = get_all_variations(all_characters)
print(variations)
