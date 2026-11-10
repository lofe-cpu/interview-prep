// База задач тренажёра.
// Чтобы добавить задачу — добавьте объект в массив TASKS ниже и перезапустите сервер.
// Новые задачи подхватятся автоматически (по полю id), существующие — обновятся.

export type Difficulty = "easy" | "medium" | "hard";

export interface Task {
  id: string;
  topic: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  /** Учебный материал — теория и правильные подходы к решению. */
  material: string;
  requirements: string[];
  clarifyingQuestions: string[];
  modelAnswer: string;
  modelCode: string;
  sortOrder: number;
}

export const TASKS: Task[] = [
  // ───────────────────────── FRONTEND ─────────────────────────
  {
    id: "js-closures",
    topic: "frontend",
    title: "Замыкания и цикл for",
    difficulty: "easy",
    sortOrder: 1,
    description:
      "Дан код, который в цикле создаёт функции и выводит значения. Объясните, что выведет каждый вызов и почему.",
    material:
      "Замыкание — это функция, которая запоминает своё лексическое окружение: переменные, объявленные снаружи в момент её создания.\n\nПеременная, объявленная через var, имеет функциональную область видимости, поэтому все итерации цикла делят одну и ту же переменную. Переменная, объявленная через let, создаётся заново на каждой итерации блока.\n\nИз-за этого каждая функция, созданная в цикле с let, захватывает своё собственное значение, а с var — одно общее.",
    requirements: [
      "Объяснить, почему переменная var «утекает» из цикла",
      "Показать минимум два способа исправить поведение (let, замыкание/IIFE)",
      "Объяснить понятие замыкания и лексического окружения",
    ],
    clarifyingQuestions: [
      "Что такое замыкание? Когда оно возникает?",
      "Чем var отличается от let в контексте цикла?",
      "Где хранится лексическое окружение функции?",
    ],
    modelAnswer:
      "С var все функции замыкаются на одну и ту же переменную i, поэтому после завершения цикла все они выводят одно и то же число (например 3). С let на каждой итерации создаётся новое окружение, и каждая функция захватывает своё значение. Это и есть замыкание — функция вместе со ссылкой на своё лексическое окружение, где были объявлены переменные.",
    modelCode: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 3 3 3
}

// исправление 1: let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 0 1 2
}

// исправление 2: IIFE
for (var i = 0; i < 3; i++) {
  (function (x) {
    setTimeout(() => console.log(x)); // 0 1 2
  })(i);
}`,
  },
  {
    id: "js-event-loop",
    topic: "frontend",
    title: "Event Loop и порядок вывода",
    difficulty: "medium",
    sortOrder: 2,
    description:
      "Определите точный порядок вывода в консоль для следующего кода и объясните, как работает event loop, макро- и микрозадачи.",
    material:
      "JavaScript — однопоточный, но асинхронность достигается через event loop и очереди задач.\n\nПорядок выполнения:\n1. Весь синхронный код.\n2. Микрозадачи — Promise.then/catch, queueMicrotask, продолжения после await.\n3. Макрозадачи — setTimeout, setInterval, I/O.\n\nМикрозадачи всегда выполняются раньше следующей макрозадачи, даже если таймер равен 0. async/await — это синтаксический сахар над Promise, поэтому код после await тоже попадает в микрозадачи.",
    requirements: [
      "Назвать порядок вывода console.log",
      "Объяснить разницу между макрозадачами и микрозадачами",
      "Объяснить, когда выполняются Promise и setTimeout",
    ],
    clarifyingQuestions: [
      "Что такое очередь микрозадач?",
      "В каком порядке обрабатываются setTimeout и Promise?",
      "Что произойдёт, если микрозадача породит другую микрозадачу?",
    ],
    modelAnswer:
      "Сначала выполняется весь синхронный код (start и end). Затем микрозадачи (Promise.then), и только потом макрозадачи (setTimeout). await — синтаксический сахар над Promise, поэтому код после await тоже попадает в микрозадачи.",
    modelCode: `console.log("start");

setTimeout(() => console.log("timeout"), 0);

Promise.resolve().then(() => console.log("promise"));

console.log("end");

// Вывод:
// start
// end
// promise
// timeout`,
  },
  {
    id: "react-rerender",
    topic: "frontend",
    title: "Когда React перерисовывает компонент",
    difficulty: "medium",
    sortOrder: 3,
    description:
      "Объясните, когда и почему React перерисовывает компонент, что такое мемоизация и как избежать лишних ре-рендеров.",
    material:
      "Компонент перерисовывается в трёх случаях:\n1. Изменился его собственный state.\n2. Перерисовывается родитель (даже если props те же).\n3. Изменилось значение контекста, который он читает.\n\nЧтобы избежать лишних рендеров: React.memo пропускает рендер дочернего компонента, если props не изменились по ссылке (shallow-сравнение); useMemo кеширует значение; useCallback стабилизирует ссылку на функцию. Состояние стараются держать как можно ниже по дереву.",
    requirements: [
      "Назвать причины ре-рендера (state, props, контекст, родитель)",
      "Объяснить React.memo, useMemo, useCallback",
      "Объяснить роль key в списках",
    ],
    clarifyingQuestions: [
      "Почему передача новой функции в props вызывает ре-рендер дочернего компонента?",
      "Когда useMemo бесполезен или вреден?",
      "Что такое «поднятие состояния» и как оно влияет на производительность?",
    ],
    modelAnswer:
      "Компонент перерисовывается, когда меняется его state, когда ре-рендерится родитель (даже если props те же), или когда меняется значение из контекста. Чтобы избежать лишних ре-рендеров, используют React.memo для дочерних компонентов, useMemo/useCallback для стабилизации ссылок, а состояние стараются держать как можно ниже по дереву.",
    modelCode: `const Expensive = React.memo(function Expensive({ items }) {
  return <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;
});

function Parent() {
  const [count, setCount] = useState(0);
  // useMemo: items не меняется при каждом рендере Parent
  const items = useMemo(() => getItems(), []);
  // useCallback: стабильная ссылка на обработчик
  const onSelect = useCallback((id) => select(id), []);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <Expensive items={items} onSelect={onSelect} />
    </>
  );
}`,
  },
  {
    id: "ts-generics",
    topic: "frontend",
    title: "TypeScript: дженерики",
    difficulty: "easy",
    sortOrder: 4,
    description:
      "Напишите типобезопасную функцию-обёртку, которая сохраняет тип входного значения, и объясните, зачем нужны дженерики.",
    material:
      "Дженерики — это параметры типов, которые позволяют писать переиспользуемый код, сохраняя при этом информацию о конкретном типе.\n\nВ отличие от any, дженерики проверяются компилятором: TypeScript выводит точные типы на месте вызова и не даёт передать несовместимое значение. Ограничение через extends сужает допустимые типы — например, <T extends { length: number }> позволяет использовать только объекты со свойством length.",
    requirements: [
      "Написать дженерик-функцию, сохраняющую тип",
      "Показать пример ограничения дженерика (extends)",
      "Объяснить, чем дженерик лучше any",
    ],
    clarifyingQuestions: [
      "Что выведет тип результата вызова identity(42)?",
      "Зачем нужно ограничение <T extends object>?",
      "Как работает type inference в дженериках?",
    ],
    modelAnswer:
      "Дженерики позволяют писать функции и типы, которые работают с любым типом, но при этом сохраняют информацию о конкретном типе. В отличие от any, компилятор проверяет корректность использования и выводит точные типы.",
    modelCode: `// дженерик-функция: тип сохраняется
function identity<T>(value: T): T {
  return value;
}

const n = identity(42);        // number
const s = identity("hello");   // string

// ограничение дженерика
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("abc");   // 3
getLength([1, 2]);  // 2
// getLength(42);   // ошибка компиляции

// дженерик-интерфейс
interface ApiResponse<T> {
  data: T;
  status: number;
}`,
  },

  {
    id: "react-rsc",
    topic: "frontend",
    title: "React Server Components",
    difficulty: "medium",
    sortOrder: 5,
    description:
      "Объясните, что такое React Server Components, чем они отличаются от клиентских компонентов и когда что использовать.",
    material:
      "React Server Components (RSC) выполняются на сервере и не попадают в JS-бандл клиента. Они могут напрямую обращаться к базе данных, файловой системе и серверным секретам.\n\nКлиентские компоненты рендерятся в браузере и нужны для интерактивности: состояния (useState), эффекты (useEffect), обработчики событий, браузерные API.\n\nВ Next.js App Router компоненты по умолчанию серверные. Директива \"use client\" вверху файла делает клиентским сам компонент и всё, что он импортирует. Граница: серверный компонент может передавать клиентскому только сериализуемые props, но может оборачивать клиентский как children.\n\nВыгода — меньше JavaScript у клиента и прямой доступ к серверным данным.",
    requirements: [
      "Объяснить разницу серверных и клиентских компонентов",
      "Объяснить директиву \"use client\" и где проходит граница",
      "Назвать выгоды RSC (размер бандла, доступ к данным)",
    ],
    clarifyingQuestions: [
      "Что серверный компонент не может делать?",
      "Как добавить интерактивность в приложение на RSC?",
      "Можно ли передать серверный компонент в клиентский?",
    ],
    modelAnswer:
      "Серверные компоненты выполняются на сервере, уменьшают JS-бандл и могут напрямую читать данные. Клиентские — для интерактивности. В App Router всё серверное по умолчанию, \"use client\" делает компонент клиентским. Серверный компонент можно передать клиентскому как children (через пропс), но не импортировать в клиентский.",
    modelCode: `// app/posts/page.tsx — серверный компонент (по умолчанию)
// может напрямую обращаться к БД, без отдельного API-слоя
export default async function PostsPage() {
  const posts = await db.post.findMany();

  return (
    <ul>
      {posts.map((p) => (
        <PostItem key={p.id} post={p} />
      ))}
    </ul>
  );
}

// app/posts/PostItem.tsx — клиентский компонент
"use client";
import { useState } from "react";

export default function PostItem({ post }) {
  const [liked, setLiked] = useState(false);
  return (
    <li>
      {post.title}
      <button onClick={() => setLiked(!liked)}>
        {liked ? "Unlike" : "Like"}
      </button>
    </li>
  );
}`,
  },
  {
    id: "ts-satisfies",
    topic: "frontend",
    title: "TypeScript: satisfies и as const",
    difficulty: "easy",
    sortOrder: 6,
    description:
      "Объясните, что делают оператор satisfies и утверждение as const, и в каких ситуациях они полезны.",
    material:
      "as const делает объект полностью readonly и сужает типы до литеральных: поля становятся неизменяемыми, а строки и числа — конкретными значениями.\n\nОператор satisfies проверяет, что значение соответствует типу, но не расширяет его — сохраняются литеральные типы и уточнённый вывод.\n\nsatisfies полезен, когда нужно и проверить соответствие типу, и сохранить точный тип для дальнейшего использования (конфиги, словари, вывод keyof).",
    requirements: [
      "Объяснить разницу между satisfies и аннотацией типа",
      "Объяснить, что делает as const",
      "Привести пример, где satisfies лучше аннотации",
    ],
    clarifyingQuestions: [
      "Чем satisfies отличается от простой аннотации : Type?",
      "Что произойдёт с типом объекта после as const?",
      "Когда as const может мешать?",
    ],
    modelAnswer:
      "as const делает значения литеральными и readonly. satisfies проверяет тип без его расширения: в отличие от аннотации : Type, которая приводит значение к общему типу и теряет литералы, satisfies сохраняет точный тип. Это удобно для конфигов и словарей, где нужны и проверка, и точные ключи.",
    modelCode: `const palette = {
  primary: "#2563eb",
  danger: "#dc2626",
} as const;
// тип: { readonly primary: "#2563eb"; readonly danger: "#dc2626" }

type Color = { primary: string; danger: string };

// аннотация теряет литералы
const a: Color = palette;
a.primary = "anything"; // ок, но тип размыт до string

// satisfies проверяет, но сохраняет литералы
const b = palette satisfies Color;
// b.primary по-прежнему тип "#2563eb"

// частый кейс: словарь + keyof
const routes = {
  home: "/",
  about: "/about",
} as const;

type Route = (typeof routes)[keyof typeof routes]; // "/" | "/about"`,
  },

  // ───────────────────────── BACKEND ─────────────────────────
  {
    id: "py-list-dict",
    topic: "backend",
    title: "Python: изменяемые vs неизменяемые",
    difficulty: "easy",
    sortOrder: 1,
    description:
      "Объясните, что произойдёт в этом коде, и почему списки ведут себя иначе, чем числа и строки.",
    material:
      "В Python списки, словари и множества изменяемы (mutable) и передаются по ссылке; числа, строки, кортежи и frozenset — неизменяемы (immutable).\n\nПри присваивании или передаче изменяемого объекта копируется ссылка на объект, а не сами данные, поэтому изменения видны во всех местах, ссылающихся на него. Для копии используйте .copy(), list(), срез [:] или copy.deepcopy() для вложенных структур.\n\nАргументы по умолчанию вычисляются один раз при определении функции, поэтому изменяемые значения по умолчанию (например, list) сохраняют состояние между вызовами — это классическая ловушка.",
    requirements: [
      "Объяснить разницу между изменяемыми и неизменяемыми типами",
      "Объяснить, что такое передача по ссылке",
      "Показать, как избежать неожиданных изменений (copy)",
    ],
    clarifyingQuestions: [
      "Почему аргументы по умолчанию лучше не делать изменяемыми?",
      "В чём разница между shallow и deep copy?",
      "Что такое идемпотентность в этом контексте?",
    ],
    modelAnswer:
      "Списки и словари передаются по ссылке: при присваивании или передаче в функцию копируется ссылка на объект, поэтому изменения видны во всех местах. Числа, строки и кортежи неизменяемы — операции создают новые объекты. Классическая ловушка — изменяемый аргумент по умолчанию, который сохраняет состояние между вызовами.",
    modelCode: `a = [1, 2, 3]
b = a
b.append(4)
print(a)  # [1, 2, 3, 4] — b и a ссылаются на один список

# правильное копирование
b = a.copy()      # или b = list(a), b = a[:]
b.append(5)
print(a)  # [1, 2, 3, 4]

# ловушка: изменяемый аргумент по умолчанию
def add(item, items=[]):
    items.append(item)
    return items

add(1)
add(2)
print(add(3))  # [1, 2, 3] — а не [3]!

# правильно
def add(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items`,
  },
  {
    id: "py-async",
    topic: "backend",
    title: "Python: async/await и GIL",
    difficulty: "medium",
    sortOrder: 2,
    description:
      "Объясните, как работает asyncio, что такое event loop и корутины, и чем асинхронность отличается от многопоточности.",
    material:
      "asyncio — это однопоточная кооперативная многозадачность: event loop переключается между корутинами в точках await, когда те ожидают I/O. Это эффективно для I/O-bound задач (сеть, БД).\n\nGIL запрещает параллельное выполнение байткода Python в нескольких потоках, поэтому потоки дают выигрыш только на I/O, но не на вычислениях. Для CPU-bound задач используют процессы (multiprocessing).\n\nКорутины запускаются конкурентно через asyncio.gather или create_task.",
    requirements: [
      "Объяснить event loop и кооперативную многозадачность",
      "Объяснить, что такое await и когда он отдаёт управление",
      "Объяснить ограничения GIL и когда нужны потоки/процессы",
    ],
    clarifyingQuestions: [
      "Для каких задач asyncio эффективен, а для каких нет?",
      "Что такое awaitable-объекты?",
      "Как запустить несколько корутин параллельно?",
    ],
    modelAnswer:
      "asyncio выполняет конкурентный код в одном потоке: event loop переключается между корутинами в точках await. Это эффективно для I/O-bound задач (сеть, БД). Для CPU-bound задач GIL мешает параллелизму в потоках — там нужны процессы (multiprocessing). Многопоточность в Python хороша для I/O, но не для параллельных вычислений.",
    modelCode: `import asyncio

async def fetch(url):
    await asyncio.sleep(1)  # имитация сетевого запроса
    return f"данные из {url}"

async def main():
    # запуск нескольких корутин конкурентно
    results = await asyncio.gather(
        fetch("a.com"),
        fetch("b.com"),
        fetch("c.com"),
    )
    print(results)

asyncio.run(main())  # ~1 секунда, а не 3`,
  },
  {
    id: "py-fastapi",
    topic: "backend",
    title: "FastAPI: валидация через Pydantic",
    difficulty: "medium",
    sortOrder: 3,
    description:
      "Спроектируйте REST-эндпоинт на FastAPI с валидацией входящих данных и понятными ошибками.",
    material:
      "FastAPI строит API на аннотациях типов и Pydantic. Модель BaseModel описывает схему тела запроса и автоматически валидирует данные: невалидный запрос отклоняется с кодом 422.\n\nПараметры пути и query-параметры определяются сигнатурой функции: то, что указано в декораторе как {param}, — путь, остальные — query. Для ограничений и описаний полей используют Field. Бизнес-ошибки возвращают через HTTPException с нужным статусом (400, 404, 409…).",
    requirements: [
      "Описать Pydantic-модель для тела запроса",
      "Добавить валидацию полей (типы, ограничения)",
      "Вернуть корректные HTTP-коды (200, 400, 404, 422)",
    ],
    clarifyingQuestions: [
      "Как FastAPI отличает параметры пути от query-параметров?",
      "Что такое dependency injection в FastAPI?",
      "Как работает автоматическая документация OpenAPI?",
    ],
    modelAnswer:
      "FastAPI строит API на аннотациях типов и Pydantic. Модель описывает схему запроса, а невалидные данные автоматически отклоняются с кодом 422. Для бизнес-ошибок используют HTTPException с нужным статусом.",
    modelCode: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class UserCreate(BaseModel):
    email: str = Field(..., pattern=r"^[\\w.]+@\\w+\\.\\w+$")
    age: int = Field(..., ge=18, le=120)
    name: str = Field(..., min_length=2, max_length=50)

users: dict[int, UserCreate] = {}

@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    for u in users.values():
        if u.email == user.email:
            raise HTTPException(409, "Email уже существует")
    uid = len(users) + 1
    users[uid] = user
    return {"id": uid, **user.model_dump()}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id not in users:
        raise HTTPException(404, "Пользователь не найден")
    return users[user_id]`,
  },

  // ───────────────────────── ALGORITHMS ─────────────────────────
  {
    id: "alg-two-sum",
    topic: "algorithms",
    title: "Two Sum",
    difficulty: "easy",
    sortOrder: 1,
    description:
      "Дан массив целых чисел nums и целевое число target. Найдите индексы двух чисел, которые в сумме дают target.",
    material:
      "Ключевая идея — хэш-таблица «значение → индекс». Проходя по массиву один раз, для каждого числа x проверяем, встречалось ли дополнение target - x среди уже пройденных элементов.\n\nЭто даёт O(n) по времени и O(n) по памяти вместо O(n²) при полном переборе двух циклов. Один и тот же элемент нельзя использовать дважды, поэтому мы кладём текущий элемент в таблицу после проверки.",
    requirements: [
      "Решение за O(n) времени с хэш-таблицей",
      "Объяснить компромисс между O(n²) и O(n)",
      "Учесть, что один и тот же элемент нельзя использовать дважды",
    ],
    clarifyingQuestions: [
      "Может ли в массиве быть несколько правильных ответов?",
      "Что если target отрицательный?",
      "Какова сложность по памяти вашего решения?",
    ],
    modelAnswer:
      "Используем хэш-таблицу: проходим по массиву, для каждого числа x ищем target - x среди уже просмотренных. Это даёт O(n) по времени и O(n) по памяти. Наивный перебор двух циклов — O(n²).",
    modelCode: `def two_sum(nums, target):
    seen = {}  # значение -> индекс
    for i, x in enumerate(nums):
        complement = target - x
        if complement in seen:
            return [seen[complement], i]
        seen[x] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]`,
  },
  {
    id: "alg-valid-parentheses",
    topic: "algorithms",
    title: "Валидные скобки",
    difficulty: "easy",
    sortOrder: 2,
    description:
      "Дана строка из скобок (), {}, []. Определите, является ли последовательность скобок корректной.",
    material:
      "Стек — идеальная структура для проверки вложенности скобок, потому что закрывающая скобка всегда соответствует последней открытой.\n\nАлгоритм: открывающую скобку кладём в стек, а при встрече закрывающей проверяем, что верх стека — соответствующая открывающая, и снимаем её. В конце стек должен быть пуст. Сложность — O(n) по времени и O(n) по памяти в худшем случае.",
    requirements: [
      "Использовать стек",
      "Обработать все три типа скобок",
      "Учесть случаи незакрытых и лишних скобок",
    ],
    clarifyingQuestions: [
      "Какова сложность по времени и памяти?",
      "Что если строка пустая?",
      "Как бы вы изменили решение, если бы скобки могли быть вложены произвольно?",
    ],
    modelAnswer:
      "Проходим по строке и кладём открывающие скобки в стек. Когда встречаем закрывающую, проверяем, что верх стека — соответствующая открывающая, и снимаем её. В конце стек должен быть пуст. Сложность O(n).",
    modelCode: `def is_valid(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        else:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

print(is_valid("()[]{}"))  # True
print(is_valid("([)]"))    # False`,
  },
  {
    id: "alg-binary-search",
    topic: "algorithms",
    title: "Бинарный поиск и его границы",
    difficulty: "medium",
    sortOrder: 3,
    description:
      "Реализуйте бинарный поиск и найдите первую позицию вхождения элемента в отсортированном массиве (lower bound).",
    material:
      "Бинарный поиск делит диапазон пополам, поддерживая инвариант «искомый ответ находится в диапазоне». Сложность — O(log n).\n\nДля нижней границы (первое вхождение) при равенстве сдвигаем правую границу, чтобы сузить поиск влево. Средний индекс считаем как l + (r - l) / 2, чтобы избежать переполнения при больших значениях l и r.\n\nРаботать удобно с полуинтервалом [l, r): цикл пока l < r, и ответ — это l.",
    requirements: [
      "Реализовать бинарный поиск без ошибок с границами",
      "Найти нижнюю границу (первое вхождение)",
      "Объяснить, почему важно не писать (l + r) / 2 без защиты от переполнения",
    ],
    clarifyingQuestions: [
      "Какова сложность бинарного поиска?",
      "Что делает lower bound при отсутствии элемента?",
      "Когда бинарный поиск неприменим?",
    ],
    modelAnswer:
      "Бинарный поиск делит диапазон пополам, поддерживая инвариант. Для lower bound при равенстве сдвигаем правую границу, чтобы найти самое левое вхождение. Сложность O(log n).",
    modelCode: `def lower_bound(nums, target):
    l, r = 0, len(nums)  # [l, r) — полуинтервал
    while l < r:
        m = l + (r - l) // 2
        if nums[m] < target:
            l = m + 1
        else:
            r = m
    return l  # индекс первого элемента >= target

nums = [1, 2, 2, 2, 3, 4]
print(lower_bound(nums, 2))  # 1`,
  },
  {
    id: "alg-hashmap",
    topic: "algorithms",
    title: "Реализация HashMap",
    difficulty: "hard",
    sortOrder: 4,
    description:
      "Спроектируйте и реализуйте простую HashMap с методами get, put, remove, используя массив и разрешение коллизий цепочками.",
    material:
      "HashMap хранит пары ключ-значение в массиве бакетов. Индекс бакета вычисляется хэш-функцией hash(key) % capacity. Коллизии (разные ключи с одним индексом) разрешаются связными списками внутри бакета.\n\nПри превышении load factor (число элементов / capacity, обычно 0.75) массив увеличивают вдвое и перехешируют все ключи, так как их индексы зависят от capacity.\n\nСредняя сложность операций get/put/remove — O(1), худшая — O(n), если все ключи попадают в один бакет.",
    requirements: [
      "Выбрать структуру хранения (массив бакетов + связные списки)",
      "Реализовать хэш-функцию и ресайз",
      "Объяснить сложность в среднем и худшем случае",
    ],
    clarifyingQuestions: [
      "Что такое коллизия и как её решать?",
      "Почему важно перехешировать при ресайзе?",
      "Какая сложность операций в среднем и в худшем случае?",
    ],
    modelAnswer:
      "HashMap хранит пары ключ-значение в массиве бакетов. Индекс вычисляется хэш-функцией, коллизии разрешаются связными списками. При росте числа элементов сверх load factor массив увеличивается вдвое и все ключи перехешируются. Средняя сложность операций O(1), худшая O(n).",
    modelCode: `class MyHashMap:
    def __init__(self):
        self.capacity = 8
        self.size = 0
        self.buckets = [[] for _ in range(self.capacity)]

    def _index(self, key):
        return hash(key) % self.capacity

    def put(self, key, value):
        if self.size / self.capacity > 0.75:
            self._resize()
        b = self.buckets[self._index(key)]
        for i, (k, v) in enumerate(b):
            if k == key:
                b[i] = (key, value)
                return
        b.append((key, value))
        self.size += 1

    def get(self, key):
        for k, v in self.buckets[self._index(key)]:
            if k == key:
                return v
        return None

    def remove(self, key):
        b = self.buckets[self._index(key)]
        for i, (k, v) in enumerate(b):
            if k == key:
                del b[i]
                self.size -= 1
                return

    def _resize(self):
        old = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        for bucket in old:
            for k, v in bucket:
                self.buckets[self._index(k)].append((k, v))`,
  },

  // ───────────────────────── SQL ─────────────────────────
  {
    id: "sql-join",
    topic: "sql",
    title: "JOIN и агрегация",
    difficulty: "easy",
    sortOrder: 1,
    description:
      "Есть таблицы users и orders. Напишите запрос, который выводит пользователей и общую сумму их заказов, включая тех, у кого заказов нет.",
    material:
      "JOIN объединяет строки таблиц по условию. LEFT JOIN сохраняет все строки левой таблицы и дополняет NULL там, где в правой нет соответствия, — поэтому пользователи без заказов остаются в результате.\n\nGROUP BY группирует строки по колонкам, а агрегатные функции (SUM, COUNT, AVG) считают значение по каждой группе. SUM по пустому набору даёт NULL, поэтому используют COALESCE, чтобы заменить его на 0.\n\nФильтрация по агрегату выполняется через HAVING, а не WHERE.",
    requirements: [
      "Использовать LEFT JOIN",
      "Использовать GROUP BY и агрегатную функцию",
      "Корректно обработать NULL (COALESCE)",
    ],
    clarifyingQuestions: [
      "Чем LEFT JOIN отличается от INNER JOIN?",
      "Что вернёт SUM, если у пользователя нет заказов?",
      "Как отфильтровать по агрегату — WHERE или HAVING?",
    ],
    modelAnswer:
      "LEFT JOIN берёт всех пользователей и присоединяет их заказы. GROUP BY группирует по пользователю, SUM суммирует суммы заказов. COALESCE превращает NULL (у пользователей без заказов) в 0. Фильтрация по агрегату выполняется через HAVING.",
    modelCode: `SELECT u.id, u.name,
       COALESCE(SUM(o.amount), 0) AS total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total DESC;`,
  },
  {
    id: "sql-index",
    topic: "sql",
    title: "Индексы и производительность",
    difficulty: "medium",
    sortOrder: 2,
    description:
      "Запрос с WHERE по колонке email работает медленно на миллионах строк. Объясните, как ускорить его и какие есть компромиссы.",
    material:
      "Индекс — это структура данных (обычно B-tree), которая позволяет находить строки за O(log n) вместо полного сканирования таблицы O(n).\n\nИндексы ускоряют SELECT с WHERE/ORDER BY/JOIN, но имеют цену: каждая вставка, обновление и удаление должны обновлять индекс, а сами индексы занимают память. Поэтому индексируют колонки, по которым часто фильтруют, а не все подряд.\n\nСоставной индекс ускоряет запросы по нескольким колонкам; порядок колонок в нём важен (левая часть индекса используется при поиске).",
    requirements: [
      "Объяснить, что делает индекс и как он ускоряет поиск",
      "Объяснить структуру B-tree индекса",
      "Назвать недостатки индексов (запись, память)",
    ],
    clarifyingQuestions: [
      "Когда индекс НЕ помогает, а мешает?",
      "Что такое составной индекс и каков порядок колонок в нём?",
      "Что такое покрывающий индекс?",
    ],
    modelAnswer:
      "Индекс по колонке email строит B-tree, позволяя находить строки за O(log n) вместо полного сканирования O(n). Цена — замедление записи (нужно обновлять индекс) и дополнительная память. Для частых SELECT по email и редких вставок это выгодно. Составной индекс ускоряет запросы по нескольким колонкам, при этом важен порядок колонок.",
    modelCode: `-- создание индекса для ускорения поиска по email
CREATE INDEX idx_users_email ON users(email);

-- составной индекс: важен порядок колонок
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- этот запрос сможет использовать индекс
SELECT * FROM users WHERE email = 'test@example.com';`,
  },
  {
    id: "sql-n-plus-one",
    topic: "sql",
    title: "Проблема N+1",
    difficulty: "medium",
    sortOrder: 3,
    description:
      "Объясните, что такое проблема N+1 запросов, почему она возникает в ORM и как её решить.",
    material:
      "Проблема N+1 возникает, когда ORM загружает список объектов одним запросом, а затем для каждого объекта делает отдельный запрос за связанными данными — итого 1 + N запросов вместо двух.\n\nРешение — eager loading (жадная загрузка): для связи один-к-одному/foreign key используют JOIN (в Django — select_related), а для many-to-many — отдельный запрос с IN и группировкой (prefetch_related).\n\nОбнаружить проблему можно по количеству SQL-запросов в логах или через инструменты вроде django-debug-toolbar.",
    requirements: [
      "Объяснить суть проблемы N+1",
      "Показать, как решить через JOIN или eager loading",
      "Упомянуть про batch-загрузку",
    ],
    clarifyingQuestions: [
      "Как обнаружить проблему N+1?",
      "Чем select_related отличается от prefetch_related?",
      "Всегда ли нужно eager loading?",
    ],
    modelAnswer:
      "Проблема N+1 возникает, когда ORM загружает список объектов одним запросом, а затем для каждого объекта делает отдельный запрос за связанными данными — итого 1 + N запросов. Решение — eager loading: JOIN (select_related) для one-to-one/foreign key или отдельный IN-запрос с группировкой (prefetch_related) для many-to-many.",
    modelCode: `-- Плохо (N+1):
SELECT * FROM posts;              -- 1 запрос
SELECT * FROM users WHERE id=1;   -- N запросов
SELECT * FROM users WHERE id=2;
-- ...

-- Хорошо (один запрос через JOIN):
SELECT p.*, u.name AS author_name
FROM posts p
JOIN users u ON u.id = p.user_id;`,
  },
  {
    id: "sql-transactions",
    topic: "sql",
    title: "Транзакции и уровни изоляции",
    difficulty: "hard",
    sortOrder: 4,
    description:
      "Объясните, что такое ACID, какие бывают уровни изоляции и какие аномалии они предотвращают.",
    material:
      "Транзакция — набор операций, которые применяются атомарно. ACID: Атомарность, Согласованность, Изолированность, Долговечность.\n\nУровни изоляции — компромисс между консистентностью и производительностью:\n• READ UNCOMMITTED допускает dirty read (чтение незакоммиченных данных).\n• READ COMMITTED допускает non-repeatable read.\n• REPEATABLE READ допускает phantom read.\n• SERIALIZABLE исключает все аномалии.\n\nДля атомарного «прочитать-изменить-записать» используют SELECT ... FOR UPDATE, который блокирует строки до конца транзакции и защищает от гонок.",
    requirements: [
      "Расшифровать ACID",
      "Назвать уровни изоляции и аномалии (dirty read, non-repeatable read, phantom)",
      "Объяснить, как SELECT FOR UPDATE помогает при гонках",
    ],
    clarifyingQuestions: [
      "Что такое dirty read?",
      "Чем REPEATABLE READ отличается от READ COMMITTED?",
      "Что такое deadlock и как его избежать?",
    ],
    modelAnswer:
      "ACID гарантирует надёжность транзакций. Уровни изоляции — компромисс между консистентностью и производительностью: READ UNCOMMITTED допускает dirty read, READ COMMITTED — non-repeatable read, REPEATABLE READ — phantom read, SERIALIZABLE исключает все. Для атомарного «прочитать-изменить-записать» используют SELECT FOR UPDATE.",
    modelCode: `BEGIN;

-- блокируем строку до конца транзакции
SELECT balance FROM accounts
WHERE id = 1
FOR UPDATE;

UPDATE accounts
SET balance = balance - 100
WHERE id = 1;

UPDATE accounts
SET balance = balance + 100
WHERE id = 2;

COMMIT;  -- или ROLLBACK при ошибке`,
  },

  // ───────────────────────── SYSTEM DESIGN ─────────────────────────
  {
    id: "sd-cache",
    topic: "system-design",
    title: "Кэширование и его стратегии",
    difficulty: "medium",
    sortOrder: 1,
    description:
      "Объясните, где разместить кэш в веб-приложении, какие стратегии инвалидации существуют и как избежать проблем.",
    material:
      "Кэш хранит часто запрашиваемые данные ближе к потребителю, снижая нагрузку на БД и время ответа. Уровни: CDN (статика), приложение (Redis/Memcached), база данных.\n\nСтратегии:\n• Cache-aside — приложение проверяет кэш, при промахе читает БД и записывает в кэш.\n• Write-through — данные пишутся в кэш и БД синхронно.\n• Write-behind — пишутся в кэш, а в БД — асинхронно.\n\nИнвалидация — по TTL или явно при изменении данных. Cache stampede (лавина запросов при массовом истечении ключа) лечат блокировкой, ранним обновлением или случайным разбросом TTL.",
    requirements: [
      "Назвать уровни кэширования (CDN, приложение, БД)",
      "Описать cache-aside, write-through, write-behind",
      "Объяснить cache stampede и способы защиты",
    ],
    clarifyingQuestions: [
      "Что кэшировать в первую очередь?",
      "Как выбрать TTL?",
      "Что такое «горячий ключ» и как с ним бороться?",
    ],
    modelAnswer:
      "Кэш размещают на уровнях CDN (статика), приложения (Redis/Memcached) и БД. Cache-aside — приложение проверяет кэш, при промахе читает БД и записывает в кэш. Инвалидация — по TTL или явно при изменении данных. Cache stampede (массовый промах по истёкшему ключу) лечат блокировкой, ранним обновлением или разбросом TTL.",
    modelCode: `# Cache-aside (Redis)
import redis, time

r = redis.Redis()

def get_user(user_id):
    key = f"user:{user_id}"
    cached = r.get(key)
    if cached:
        return cached  # попадание в кэш

    user = db.get_user(user_id)        # промах — читаем БД
    r.setex(key, 300, user)            # кладём в кэш на 5 минут
    return user`,
  },
  {
    id: "sd-sharding",
    topic: "system-design",
    title: "Шардирование базы данных",
    difficulty: "hard",
    sortOrder: 2,
    description:
      "Объясните, когда и как шардировать базу данных, какие ключи шардирования бывают и какие проблемы это создаёт.",
    material:
      "Шардирование — разбиение данных по нескольким серверам для горизонтального масштабирования, когда данные не помещаются на одном сервере или упираются в его производительность.\n\nКлюч шардирования выбирают так, чтобы данные распределялись равномерно и большинство запросов попадало в один шард. Шардирование по диапазону удобно для range-запросов, по хэшу — для равномерности.\n\nConsistent hashing минимизирует перемещение данных при изменении числа шардов. Минусы — сложность JOIN и транзакций между шардами.",
    requirements: [
      "Объяснить вертикальное vs горизонтальное масштабирование",
      "Описать шардирование по диапазону и по хэшу",
      "Назвать проблемы: cross-shard join, rebalancing, hotspots",
    ],
    clarifyingQuestions: [
      "Чем шардирование отличается от репликации?",
      "Что такое consistent hashing?",
      "Как выбрать ключ шардирования?",
    ],
    modelAnswer:
      "Шардирование нужно, когда данные не помещаются на одном сервере или упираются в его производительность. Ключ шардирования выбирают так, чтобы данные распределялись равномерно и большинство запросов попадало в один шард. Consistent hashing минимизирует перемещение данных при изменении числа шардов. Минусы — сложность JOIN и транзакций между шардами.",
    modelCode: `# выбор шарда по хэшу ключа
def get_shard(user_id, num_shards=4):
    return hash(user_id) % num_shards

# consistent hashing: ключи распределяются по кольцу
import hashlib, bisect

class ConsistentHash:
    def __init__(self, nodes, replicas=100):
        self.ring = []
        for node in nodes:
            for i in range(replicas):
                h = hashlib.md5(f"{node}:{i}".encode()).hexdigest()
                self.ring.append((int(h, 16), node))
        self.ring.sort()

    def get_node(self, key):
        h = int(hashlib.md5(key.encode()).hexdigest(), 16)
        idx = bisect.bisect_right(self.ring, (h, ""))
        if idx == len(self.ring):
            idx = 0
        return self.ring[idx][1]`,
  },
  {
    id: "sd-rate-limit",
    topic: "system-design",
    title: "Rate limiting",
    difficulty: "medium",
    sortOrder: 3,
    description:
      "Спроектируйте rate limiter для API. Какие алгоритмы существуют и как выбрать подходящий?",
    material:
      "Rate limiting ограничивает частоту запросов, защищая API от перегрузки и злоупотреблений.\n\nАлгоритмы:\n• Fixed window — простой, но допускает всплески на границах окон.\n• Sliding window — точнее, но требует больше памяти.\n• Token bucket — ведро с токенами, пополняемое с фиксированной скоростью; допускает кратковременные всплески.\n\nВ распределённой среде счётчики хранят в Redis с атомарными операциями (INCR + EXPIRE). При превышении лимита возвращают 429 с заголовком Retry-After.",
    requirements: [
      "Описать token bucket, sliding window, fixed window",
      "Объяснить, где разместить лимитер (gateway, приложение)",
      "Учесть распределённую среду (несколько серверов)",
    ],
    clarifyingQuestions: [
      "Что делать при превышении лимита — 429 или очередь?",
      "Как лимитировать по пользователю vs по IP?",
      "Почему fixed window допускает всплески на границах окон?",
    ],
    modelAnswer:
      "Token bucket — ведро с токенами, пополняемое с фиксированной скоростью; допускает всплески. Sliding window точнее, но дороже. В распределённой системе счётчики хранят в Redis с атомарными операциями. Превышение лимита возвращает 429 с заголовками Retry-After.",
    modelCode: `# Token bucket
import time

class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate  # токенов в секунду
        self.last = time.time()

    def allow(self):
        now = time.time()
        self.tokens = min(
            self.capacity,
            self.tokens + (now - self.last) * self.refill_rate,
        )
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False  # отклонить запрос (429)`,
  },

  // ───────────────────────── AI / LLM ─────────────────────────
  {
    id: "ai-rag",
    topic: "ai",
    title: "Объясните RAG",
    difficulty: "medium",
    sortOrder: 1,
    description:
      "Объясните, что такое RAG (Retrieval-Augmented Generation), зачем он нужен и из каких компонентов состоит.",
    material:
      "RAG (Retrieval-Augmented Generation) дополняет ответ LLM релевантными данными из внешнего источника, решая две проблемы моделей — галлюцинации и устаревшие знания.\n\nЭтапы:\n1. Индексация — документы разбиваются на чанки, превращаются в эмбеддинги и кладутся в векторную БД.\n2. Retrieval — на запрос ищутся топ-k похожих чанков по смыслу (по близости векторов).\n3. Генерация — найденный контекст подставляется в промпт, и модель отвечает на его основе.\n\nВ отличие от fine-tuning, RAG не меняет веса модели и позволяет использовать актуальные приватные данные без переобучения.",
    requirements: [
      "Объяснить ограничения LLM (галлюцинации, устаревшие знания)",
      "Описать этапы: индексация, retrieval, генерация",
      "Объяснить роль эмбеддингов и векторной БД",
    ],
    clarifyingQuestions: [
      "Чем RAG отличается от fine-tuning?",
      "Что такое chunking и зачем он нужен?",
      "Как оценить качество RAG?",
    ],
    modelAnswer:
      "RAG дополняет ответ LLM релевантными данными из внешнего источника: документы разбиваются на чанки, превращаются в эмбеддинги и кладутся в векторную БД. На запрос пользователя ищутся похожие чанки, которые подставляются в промпт как контекст. Это уменьшает галлюцинации и позволяет использовать свежие приватные данные без переобучения модели.",
    modelCode: `# Пайплайн RAG (упрощённо)
from openai import OpenAI

client = OpenAI()

# 1. Индексация: чанки -> эмбеддинги -> векторная БД
def index(docs):
    for doc in docs:
        emb = client.embeddings.create(
            model="text-embedding-3-small", input=doc.text
        )
        vector_db.insert(emb, doc.text)

# 2. Retrieval: поиск релевантного контекста
def retrieve(query, k=3):
    q_emb = client.embeddings.create(
        model="text-embedding-3-small", input=query
    )
    return vector_db.search(q_emb, k)

# 3. Генерация с контекстом
def answer(query):
    context = retrieve(query)
    prompt = f"Контекст:\\n{context}\\n\\nВопрос: {query}"
    return client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
    )`,
  },
  {
    id: "ai-prompting",
    topic: "ai",
    title: "Техники промптинга",
    difficulty: "easy",
    sortOrder: 2,
    description:
      "Назовите и объясните основные техники промптинга для LLM: zero-shot, few-shot, chain-of-thought.",
    material:
      "Техники промптинга управляют качеством ответов LLM:\n\n• Zero-shot — вопрос без примеров; модель отвечает, опираясь только на инструкцию.\n• Few-shot — несколько примеров формата «ввод → вывод», которые задают ожидаемый стиль и структуру ответа.\n• Chain-of-thought — просьба рассуждать по шагам перед ответом; улучшает результаты на задачах, требующих логики и вычислений.\n\nСистемный промпт задаёт роль и тон модели. Few-shot эффективен, когда формат ответа важен, а zero-shot — для простых задач.",
    requirements: [
      "Объяснить zero-shot и few-shot",
      "Объяснить chain-of-thought и когда он помогает",
      "Привести примеры промптов",
    ],
    clarifyingQuestions: [
      "Когда few-shot эффективнее zero-shot?",
      "Что такое «роль» в системном промпте?",
      "Какие риски у chain-of-thought?",
    ],
    modelAnswer:
      "Zero-shot — вопрос без примеров. Few-shot — несколько примеров формата ввода/вывода, которые направляют модель. Chain-of-thought побуждает модель рассуждать по шагам перед ответом, что улучшает результаты на задачах, требующих логики и вычислений. Системный промпт задаёт роль и тон.",
    modelCode: `# zero-shot
"Переведи на английский: Привет, мир"

# few-shot (примеры формата)
"Q: кот -> A: cat
 Q: собака -> A: dog
 Q: птица -> A:"

# chain-of-thought
"Реши задачу по шагам, объясняя рассуждения:
 В магазине было 10 яблок, купили 3, потом привезли 5.
 Сколько яблок осталось?"`,
  },
  {
    id: "ai-agents",
    topic: "ai",
    title: "Агенты и вызов инструментов",
    difficulty: "hard",
    sortOrder: 3,
    description:
      "Объясните, что такое LLM-агент, как работает function calling и какие проблемы возникают при построении агентов.",
    material:
      "LLM-агент — это модель в цикле «рассуждение → действие → наблюдение»: она решает вызвать инструмент (поиск, БД, калькулятор), получает результат и продолжает, пока не сформулирует ответ.\n\nFunction calling (tool use) — механизм, при котором модель возвращает имя функции и аргументы в структурированном виде, а вызывать функцию и передавать результат обратно — задача вашего кода.\n\nОсновные проблемы: зацикливание (модель повторяет одни и те же действия), рост стоимости и токенов, а также риск выполнения опасных действий — поэтому нужны лимиты шагов, валидация вызовов и sandbox.",
    requirements: [
      "Объяснить цикл «рассуждение -> действие -> наблюдение»",
      "Описать function calling / tool use",
      "Назвать проблемы: петли, стоимость, безопасность",
    ],
    clarifyingQuestions: [
      "Чем агент отличается от обычного чат-бота?",
      "Как предотвратить бесконечные циклы агента?",
      "Как валидировать вызовы инструментов?",
    ],
    modelAnswer:
      "Агент — это LLM в цикле: модель рассуждает, решает вызвать инструмент (поиск, БД, калькулятор), получает результат и продолжает, пока не сформулирует ответ. Function calling — механизм, при котором модель возвращает имя функции и аргументы в структурированном виде. Проблемы — зацикливание, рост стоимости и токенов, а также риски выполнения опасных действий, поэтому нужны лимиты шагов и валидация.",
    modelCode: `# Function calling (OpenAI)
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Получить погоду по городу",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                },
                "required": ["city"],
            },
        },
    }
]

resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Какая погода в Лондоне?"}],
    tools=tools,
)

call = resp.choices[0].message.tool_calls[0]
if call.function.name == "get_weather":
    args = json.loads(call.function.arguments)
    weather = get_weather(args["city"])  # реальный вызов функции`,
  },
  {
    id: "ai-evaluation",
    topic: "ai",
    title: "Оценка качества LLM и RAG",
    difficulty: "medium",
    sortOrder: 4,
    description:
      "Как оценить качество LLM-приложения или RAG-системы? Назовите метрики и подходы к оценке.",
    material:
      "LLM генерируют свободный текст, поэтому классические метрики (BLEU, ROUGE) подходят плохо — они сравнивают по перекрытию слов, а не по смыслу.\n\nОсновные подходы:\n• LLM-as-judge — сильная модель оценивает ответ по критериям (релевантность, точность, полнота).\n• Человеческая оценка — золотой стандарт, но дорого и медленно.\n• Специфичные метрики для RAG: faithfulness (соответствует ли ответ найденному контексту), answer relevance, context relevance; для retrieval — recall@k, MRR, nDCG.\n\nСтроят golden-датасет (вопросы + эталонные ответы) для воспроизводимой офлайн-оценки при изменениях промпта или пайплайна, а в проде смотрят онлайн-метрики (рейтинги, ретраи).",
    requirements: [
      "Объяснить, почему BLEU/ROUGE слабы для LLM",
      "Описать LLM-as-judge и его ограничения",
      "Назвать метрики для retrieval и для RAG-ответов",
    ],
    clarifyingQuestions: [
      "Что такое faithfulness в RAG?",
      "Чем офлайн-оценка отличается от онлайн?",
      "Как уменьшить субъективность LLM-as-judge?",
    ],
    modelAnswer:
      "Качество LLM оценивают через LLM-as-judge, человеческую оценку и специфичные метрики. Для RAG важны faithfulness (соответствие контексту), relevance ответа и контекста; для retrieval — recall@k, MRR, nDCG. Нужен golden-датасет для воспроизводимой офлайн-оценки и онлайн-метрики в проде.",
    modelCode: `# Оценка retrieval (recall@k)
def recall_at_k(retrieved_ids, relevant_ids, k):
    top_k = retrieved_ids[:k]
    hits = set(top_k) & set(relevant_ids)
    return len(hits) / len(relevant_ids)

# LLM-as-judge (упрощённо)
def judge(answer, context, question):
    prompt = f"""Оцени, соответствует ли ответ контексту (faithfulness):
Вопрос: {question}
Контекст: {context}
Ответ: {answer}

Ответь только: 1 (полностью), 0.5 (частично) или 0 (нет)."""
    return float(llm(prompt))`,
  },
];
