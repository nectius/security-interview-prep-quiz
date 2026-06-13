import { FormEvent, useMemo, useState } from 'react';
import questionsData from './data/questions.json';

type QuestionType = 'multiple-choice' | 'free-text';
type Difficulty = 'easy' | 'intermediate' | 'advanced' | 'hard' | string;

type BaseQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  correctAnswer: string;
  explanation: string;
  category?: string;
  difficulty?: Difficulty;
};

type MultipleChoiceQuestion = BaseQuestion & {
  type: 'multiple-choice';
  options: string[];
};

type FreeTextQuestion = BaseQuestion & {
  type: 'free-text';
  options?: never;
};

type Question = MultipleChoiceQuestion | FreeTextQuestion;

type AnswerState = {
  selectedOption: string;
  freeTextAnswer: string;
  isSubmitted: boolean;
};

const SESSION_LENGTH = 30;
const questions = questionsData as Question[];
const difficultyOrder = ['easy', 'intermediate', 'advanced', 'hard'];

function shuffleQuestions(items: Question[]) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, SESSION_LENGTH);
}

function formatDifficulty(difficulty?: string) {
  if (!difficulty) {
    return 'Unspecified';
  }

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function getDifficultyClassName(difficulty?: string) {
  return `difficulty-pill difficulty-${difficulty?.toLowerCase() ?? 'unspecified'}`;
}

function App() {
  const [sessionId, setSessionId] = useState(0);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const availableDifficulties = useMemo(() => {
    const difficulties = Array.from(
      new Set(questions.map((question) => question.difficulty).filter(Boolean) as string[]),
    );

    return difficulties.sort((first, second) => {
      const firstIndex = difficultyOrder.indexOf(first.toLowerCase());
      const secondIndex = difficultyOrder.indexOf(second.toLowerCase());

      if (firstIndex === -1 && secondIndex === -1) {
        return first.localeCompare(second);
      }

      if (firstIndex === -1) {
        return 1;
      }

      if (secondIndex === -1) {
        return -1;
      }

      return firstIndex - secondIndex;
    });
  }, []);
  const filteredQuestions = useMemo(() => {
    if (selectedDifficulties.length === 0) {
      return questions;
    }

    return questions.filter((question) => question.difficulty && selectedDifficulties.includes(question.difficulty));
  }, [selectedDifficulties]);
  const sessionQuestions = useMemo(() => shuffleQuestions(filteredQuestions), [filteredQuestions, sessionId]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [freeTextAnswer, setFreeTextAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answerStates, setAnswerStates] = useState<Record<number, AnswerState>>({});
  const [multipleChoiceScore, setMultipleChoiceScore] = useState(0);
  const [answeredMultipleChoice, setAnsweredMultipleChoice] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = sessionQuestions[currentIndex];
  const isMultipleChoice = currentQuestion?.type === 'multiple-choice';
  const userAnswer = isMultipleChoice ? selectedOption : freeTextAnswer.trim();
  const isCorrect = isMultipleChoice && selectedOption === currentQuestion.correctAnswer;
  const progressText = `${Math.min(currentIndex + 1, sessionQuestions.length)} of ${sessionQuestions.length}`;

  function resetAnswerState() {
    setSelectedOption('');
    setFreeTextAnswer('');
    setIsSubmitted(false);
  }

  function resetSession() {
    setCurrentIndex(0);
    setMultipleChoiceScore(0);
    setAnsweredMultipleChoice(0);
    setAnswerStates({});
    setIsFinished(false);
    resetAnswerState();
    setSessionId((id) => id + 1);
  }

  function loadAnswerState(index: number) {
    const savedAnswer = answerStates[index];

    if (!savedAnswer) {
      resetAnswerState();
      return;
    }

    setSelectedOption(savedAnswer.selectedOption);
    setFreeTextAnswer(savedAnswer.freeTextAnswer);
    setIsSubmitted(savedAnswer.isSubmitted);
  }

  function handleDifficultyToggle(difficulty: string) {
    setSelectedDifficulties((currentDifficulties) => {
      if (currentDifficulties.includes(difficulty)) {
        return currentDifficulties.filter((selectedDifficulty) => selectedDifficulty !== difficulty);
      }

      return [...currentDifficulties, difficulty];
    });
    resetSession();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userAnswer || isSubmitted || !currentQuestion) {
      return;
    }

    if (isMultipleChoice) {
      setAnsweredMultipleChoice((count) => count + 1);
      if (isCorrect) {
        setMultipleChoiceScore((score) => score + 1);
      }
    }

    setAnswerStates((answers) => ({
      ...answers,
      [currentIndex]: {
        selectedOption,
        freeTextAnswer,
        isSubmitted: true,
      },
    }));
    setIsSubmitted(true);
  }

  function handlePreviousQuestion() {
    if (currentIndex === 0) {
      return;
    }

    const previousIndex = currentIndex - 1;
    setCurrentIndex(previousIndex);
    loadAnswerState(previousIndex);
  }

  function handleNextQuestion() {
    if (currentIndex + 1 >= sessionQuestions.length) {
      setIsFinished(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    loadAnswerState(nextIndex);
  }

  function handleRestart() {
    resetSession();
  }

  if (!currentQuestion) {
    return (
      <main className="app-shell">
        <section className="card centered-card">
          <p className="eyebrow">Question bank is empty</p>
          <h1>Add questions to start the quiz</h1>
          <p>Put question objects in <code>src/data/questions.json</code>, then restart the app.</p>
        </section>
      </main>
    );
  }

  if (isFinished) {
    const percentage = answeredMultipleChoice
      ? Math.round((multipleChoiceScore / answeredMultipleChoice) * 100)
      : 0;

    return (
      <main className="app-shell">
        <section className="card results-card">
          <p className="eyebrow">Session complete</p>
          <h1>Final results</h1>
          <div className="score-panel">
            <span className="score-number">{percentage}%</span>
            <span>Multiple-choice score</span>
          </div>
          <div className="results-grid">
            <div>
              <strong>{multipleChoiceScore}</strong>
              <span>Correct</span>
            </div>
            <div>
              <strong>{answeredMultipleChoice}</strong>
              <span>MC questions scored</span>
            </div>
            <div>
              <strong>{sessionQuestions.length}</strong>
              <span>Total questions reviewed</span>
            </div>
          </div>
          <p className="muted">
            Free-text questions are for self-review, so they reveal the model answer without changing your score.
          </p>
          <button className="primary-button" onClick={handleRestart} type="button">
            Start a new session
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Cybersecurity interview practice</p>
        <h1>Security Interview Prep Quiz</h1>
        <p>
          Work through up to 30 randomized questions, submit each answer, then review the correct answer
          and explanation before moving on.
        </p>
      </section>

      <section className="card quiz-card" aria-live="polite">
        <div className="difficulty-filter" aria-label="Choose question difficulties">
          <span>Difficulty for next questions</span>
          <div className="difficulty-options">
            {availableDifficulties.map((difficulty) => (
              <button
                className={`difficulty-toggle ${selectedDifficulties.includes(difficulty) ? 'selected' : ''}`}
                key={difficulty}
                onClick={() => handleDifficultyToggle(difficulty)}
                type="button"
              >
                {formatDifficulty(difficulty)}
              </button>
            ))}
          </div>
          <p className="filter-help">
            {selectedDifficulties.length === 0
              ? 'All difficulties are included until you select one or more filters.'
              : `Showing only: ${selectedDifficulties.map(formatDifficulty).join(', ')}`}
          </p>
        </div>

        <div className="quiz-meta">
          <span>{progressText}</span>
          <span className="question-taxonomy">
            <span>{currentQuestion.category ?? 'General security'}</span>
            <span className={getDifficultyClassName(currentQuestion.difficulty)}>
              {formatDifficulty(currentQuestion.difficulty)}
            </span>
          </span>
          <span>{isMultipleChoice ? 'Multiple choice' : 'Free text'}</span>
        </div>

        <div className="progress-track" aria-label={`Question ${progressText}`}>
          <div
            className="progress-bar"
            style={{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }}
          />
        </div>

        <h2>{currentQuestion.prompt}</h2>

        <form onSubmit={handleSubmit}>
          {isMultipleChoice ? (
            <div className="options-list">
              {currentQuestion.options.map((option) => (
                <label
                  className={`option-card ${selectedOption === option ? 'selected' : ''}`}
                  key={option}
                >
                  <input
                    checked={selectedOption === option}
                    disabled={isSubmitted}
                    name={currentQuestion.id}
                    onChange={() => setSelectedOption(option)}
                    type="radio"
                    value={option}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <label className="free-text-label">
              Your answer
              <textarea
                disabled={isSubmitted}
                onChange={(event) => setFreeTextAnswer(event.target.value)}
                placeholder="Type your response, then compare it with the model answer."
                rows={5}
                value={freeTextAnswer}
              />
            </label>
          )}

          <div className="actions">
            <button
              aria-label="Go to previous question"
              className="secondary-button icon-button"
              disabled={currentIndex === 0}
              onClick={handlePreviousQuestion}
              type="button"
            >
              ← Previous
            </button>
            <button className="primary-button" disabled={!userAnswer || isSubmitted} type="submit">
              Submit Answer
            </button>
            {isSubmitted && (
              <button className="secondary-button" onClick={handleNextQuestion} type="button">
                {currentIndex + 1 >= sessionQuestions.length ? 'See Results' : 'Next Question'}
              </button>
            )}
          </div>
        </form>

        {isSubmitted && (
          <aside className={`answer-panel ${isCorrect ? 'correct' : 'review'}`}>
            {isMultipleChoice && (
              <p className="verdict">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
            )}
            {!isMultipleChoice && <p className="verdict">Compare your response</p>}
            <p>
              <strong>Correct answer:</strong> {currentQuestion.correctAnswer}
            </p>
            <p>{currentQuestion.explanation}</p>
          </aside>
        )}
      </section>
    </main>
  );
}

export default App;
