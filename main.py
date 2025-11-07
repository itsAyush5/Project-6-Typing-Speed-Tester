import time
import random
from colorama import Fore, Style, init


init(autoreset=True)
SENTENCES = [
    "Practice makes progress not perfection.",
    "Type swiftly but aim for accuracy first.",
    "Consistency beats intensity over the long run.",
    "Errors help you learn faster when you review them.",
    "Small steps forward still move you ahead.",
    "A cloud weighs around a million tonnes.",
    "Your brain is constantly eating itself.",
    "The largest piece of fossilised dinosaur poo discovered is over 30cm long and over two litres in volume."
]

def sanitize_word(word: str) -> str:
    """
    Convert a word to a simple comparable form:
    - Lowercase
    - Keep only alphanumeric characters (ignore punctuation)
    This helps make accuracy fairer for beginners.
    """
    return "".join(ch for ch in word.lower() if ch.isalnum())

def calculate_accuracy(target: str, typed: str) -> float:
    """
    Word-level accuracy:
    - Split both target and typed into words
    - Compare by position after sanitizing (case-insensitive, ignore punctuation)
    - Accuracy = correctly matched words / total words in target
    Extra/missing words count as incorrect.
    """
    target_words = target.split()
    typed_words = typed.split()

    if len(target_words) == 0:
        return 0.0

    correct = 0
    for i in range(len(target_words)):
        if i < len(typed_words):
            if sanitize_word(typed_words[i]) == sanitize_word(target_words[i]):
                correct += 1

    return (correct / len(target_words)) * 100.0

def calculate_wpm(typed: str, elapsed_seconds: float) -> float:
    """
    WPM = number of words typed / minutes
    - Words are counted simply via typed.split()
    - Protect against tiny elapsed times to avoid huge WPM spikes
    """
    words = len(typed.split())

    safe_seconds = max(elapsed_seconds, 0.5)
    minutes = safe_seconds / 60.0
    return words / minutes if minutes > 0 else 0.0

def color_for_metric(value: float, good: float, ok: float) -> str:
    """
    Return a color based on thresholds:
    - value >= good : green
    - value >= ok   : yellow
    - else          : red
    """
    if value >= good:
        return Fore.GREEN + Style.BRIGHT
    if value >= ok:
        return Fore.YELLOW + Style.BRIGHT
    return Fore.RED + Style.BRIGHT

def feedback_message(wpm: float, accuracy: float) -> str:
    """
    Provide a friendly message based on WPM and accuracy.
    """
    if accuracy >= 90 and wpm >= 50:
        return f"{Fore.GREEN}Excellent typing! Speed and accuracy are both impressive."
    if accuracy >= 80 and wpm >= 40:
        return f"{Fore.GREEN}Great job! Strong balance of speed and accuracy."
    if accuracy >= 70 and wpm >= 30:
        return f"{Fore.YELLOW}Nice work! Keep practicing to lift both speed and accuracy."
    if accuracy >= 60:
        return f"{Fore.YELLOW}Good effort. Focus on accuracy first, speed will follow."
    return f"{Fore.RED}Keep going. Aim for accuracy first, then gradually increase speed."

def main():

    print(Fore.CYAN + Style.BRIGHT + "\n=== Typing Speed Tester ===\n")
    print(Fore.WHITE + "Instructions:")
    print("- You will see a sentence to type.")
    print("- Press Enter to start, then type the sentence exactly and press Enter again.\n")


    target_sentence = random.choice(SENTENCES)

    input(Fore.MAGENTA + "Press Enter when you are ready to see the sentence...")

    print("\nType the sentence below:\n")
    print(Fore.YELLOW + Style.BRIGHT + f"  {target_sentence}\n")


    print(Fore.WHITE + "Start typing and press Enter when done:\n")
    start = time.perf_counter()
    typed_sentence = input(Fore.WHITE + "> ")
    end = time.perf_counter()


    elapsed = end - start
    accuracy = calculate_accuracy(target_sentence, typed_sentence)
    wpm = calculate_wpm(typed_sentence, elapsed)


    time_color = Fore.CYAN + Style.BRIGHT
    wpm_color = color_for_metric(wpm, good=50, ok=30)
    acc_color = color_for_metric(accuracy, good=90, ok=75)


    print(Fore.CYAN + Style.BRIGHT + "\n--- Results ---")
    print(time_color + f"Time Taken : {elapsed:.2f} seconds")
    print(wpm_color + f"WPM        : {wpm:.2f}")
    print(acc_color + f"Accuracy   : {accuracy:.2f}%")


    print("\n" + feedback_message(wpm, accuracy) + Style.RESET_ALL)


    print(Fore.BLUE + "\nTip: Prioritize accuracy. As you get comfortable, your speed will naturally improve.\n")

if __name__ == "__main__":
    main()
