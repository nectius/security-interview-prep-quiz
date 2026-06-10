import { FormEvent, useMemo, useState } from 'react';
import questionsData from './data/questions.json';

type QuestionType = 'multiple-choice' | 'free-text';

type BaseQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  correctAnswer: string;
  explanation: string;
  category?: string;
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
const emptyAnswerState: AnswerState = {
  selectedOption: '',
  freeTextAnswer: '',
  isSubmitted: false,
};

function shuffleQuestions(items: Question[]) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, SESSION_LENGTH);
}

function App() {
  const [sessionId, setSessionId] = useState(0);
  const sessionQuestions = useMemo(() => shuffleQuestions(questions), [sessionId]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByIndex, setAnswersByIndex] = useState<Record<number, AnswerState>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = sessionQuestions[currentIndex];
  const currentAnswer = answersByIndex[currentIndex] ?? emptyAnswerState;
  const isMultipleChoice = currentQuestion?.type === 'multiple-choice';
  const userAnswer = isMultipleChoice ? currentAnswer.selectedOption : currentAnswer.freeTextAnswer.trim();
  const isCorrect = isMultipleChoice && currentAnswer.selectedOption === currentQuestion.correctAnswer;
  const progressText = `${Math.min(currentIndex + 1, sessionQuestions.length)} of ${sessionQuestions.length}`;
  const hasPreviousQuestion = currentIndex > 0;
  const answeredMultipleChoice = sessionQuestions.filter(
    (question, index) => question.type === 'multiple-choice' && answersByIndex[index]?.isSubmitted,
  ).length;
  const multipleChoiceScore = sessionQuestions.filter(
    (question, index) => question.type === 'multiple-choice'
      && answersByIndex[index]?.isSubmitted
      && answersByIndex[index]?.selectedOption === question.correctAnswer,
  ).length;

  function updateCurrentAnswer(updates: Partial<AnswerState>) {
    setAnswersByIndex((answers) => ({
      ...answers,
      [currentIndex]: {
        ...emptyAnswerState,
        ...answers[currentIndex],
        ...updates,
      },
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userAnswer || currentAnswer.isSubmitted || !currentQuestion) {
      return;
    }

    updateCurrentAnswer({ isSubmitted: true });
  }

  function handlePreviousQuestion() {
    if (!hasPreviousQuestion) {
      return;
    }

    setCurrentIndex((index) => index - 1);
  }

  function handleNextQuestion() {
    if (currentIndex + 1 >= sessionQuestions.length) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setAnswersByIndex({});
    setIsFinished(false);
    setSessionId((id) => id + 1);
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
        <div className="question-nav">
          <button
            aria-label="Go to previous question"
            className="icon-button"
            disabled={!hasPreviousQuestion}
            onClick={handlePreviousQuestion}
            type="button"
          >
            ←
          </button>
          <span>Previous question</span>
        </div>

        <div className="quiz-meta">
          <span>{progressText}</span>
          <span>{currentQuestion.category ?? 'General security'}</span>
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
                  className={`option-card ${currentAnswer.selectedOption === option ? 'selected' : ''}`}
                  key={option}
                >
                  <input
                    checked={currentAnswer.selectedOption === option}
                    disabled={currentAnswer.isSubmitted}
                    name={currentQuestion.id}
                    onChange={() => updateCurrentAnswer({ selectedOption: option })}
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
                disabled={currentAnswer.isSubmitted}
                onChange={(event) => updateCurrentAnswer({ freeTextAnswer: event.target.value })}
                placeholder="Type your response, then compare it with the model answer."
                rows={5}
                value={currentAnswer.freeTextAnswer}
              />
            </label>
          )}

          <div className="actions">
            <button className="primary-button" disabled={!userAnswer || currentAnswer.isSubmitted} type="submit">
              Submit Answer
            </button>
            {currentAnswer.isSubmitted && (
              <button className="secondary-button" onClick={handleNextQuestion} type="button">
                {currentIndex + 1 >= sessionQuestions.length ? 'See Results' : 'Next Question'}
              </button>
            )}
          </div>
        </form>

        {currentAnswer.isSubmitted && (
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
