This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Auth Setup

Start by installing the following dependencies:

```bash
npm i react-icons react-hook-form clsx
```

From here, create a new component called `AuthForm.tsx`

```tsx
const AuthForm = () => {
  return (
    <div>
      <h1>AuthForm</h1>
    </div>
  )
}

export default AuthForm
```

To use `react-hook-form`, we can import it and use the hook in our component:

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FieldValues>({
  defaultValues: {
    name: '',
    email: '',
    password: '',
  },
});
```

We then create our own `onSubmit()` method to handle the form submission:

```tsx
const onSubmit: SubmitHandler<FieldValues> = data => {
  setIsLoading(true);

  if (variant === 'REGISTER') {
    // Axios register
  }

  if (variant === 'LOGIN') {
    // NextAuth SignIn
  }
};
```

This will be different depending on the application. In this case, we are using NextAuth to handle our authentication and a call to our API using Axios to register a new user.

We can then create our form:

```tsx
<form onSubmit={handleSubmit(onSubmit)}>
  {/* JSX */}
</form>
```

We wrap our `onSubmit()` method in the `handleSubmit()` method provided by `react-hook-form` so that it can access the data from our form.

## MongoDB and Prisma Setup

Start by installing the following dependencies:

```bash
npm i -D prisma
```

Initialize Prisma with the following command:

```bash
npx prisma init
```

Change the `schema.prisma` file to use MongoDB and edit the `DATABASE_URL` in the `.env` file:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

We will not show the `.env` file in the README for security reasons.

Now, let's create the `User` model:

```prisma
model User {
  id             String    @id @default(auto()) @map("_id") @db.ObjectId
  name           String?
  email          String?   @unique
  emailVerified  DateTime?
  image          String?
  hashedPassword String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  conversations   Conversation[] @relation(fields: [conversationIds], references: [id])
  conversationIds String[]       @db.ObjectId

  seenMessages   Message[] @relation("Seen", fields: [seenMessageIds], references: [id])
  seenMessageIds String[]  @db.ObjectId

  accounts Account[]
  messages Message[]
}
```

The `id` field uses the `@db.ObjectId` attribute to tell Prisma that this field should be stored as an `ObjectId` in MongoDB. This is because MongoDB uses `ObjectId`s as the primary key for each document. We also use `@map("_id")` to tell Prisma that this field should be mapped to the `_id` field in MongoDB.

Notice that we have `name`, `email`, etc. as optional fields. This is because our authentication will allow for social logins, which will not require many of these fields.

Each user will have a list of conversations that they are a part of, as well as a list of messages that they have seen. This will be used to display the number of unread messages in the sidebar.

We will also have a list of accounts that the user has connected to their profile, and a list of messages that they have sent.

Next, we will create the `Account` model:

```prisma
model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refreshToken      String? @db.String
  accessToken       String? @db.String
  expiresAt         Int?
  tokenType         String?
  scope             String?
  idToken           String? @db.String
  sessionState      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

This will be used to store the user's social logins and their access tokens. `userId` is a foreign key that references the `id` field in the `User` model. `provider` is the name of the provider, such as `google` or `github`. `providerAccountId` is the ID of the user on that provider's platform.

Notice that we have a block level attribute `@@unique([provider, providerAccountId])`. This tells Prisma that the combination of `provider` and `providerAccountId` should be unique. This is because a user can only have one account per provider.

Next, we will create the `Conversation` model:

```prisma
model Conversation {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  createdAt     DateTime @default(now())
  lastMessageAt DateTime @default(now())
  name          String?
  isGroup       Boolean?

  messages   Message[]
  messageIds String[]  @db.ObjectId

  users   User[]   @relation(fields: [userIds], references: [id])
  userIds String[] @db.ObjectId
}
```

Each conversation will have a list of messages, as well as a list of users. `userIds` is a list of foreign keys that reference the `id` field in the `User` model. We also have an `isGroup` field that will be used to determine if the conversation is a group chat or not.

Finally, we will create the `Message` model:

```prisma
model Message {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  body      String?
  image     String?
  createdAt DateTime @default(now())

  seen    User[]   @relation("Seen", fields: [seenIds], references: [id])
  seenIds String[] @db.ObjectId

  conversation   Conversation @relation(fields: [conversationId], references: [id])
  conversationId String       @db.ObjectId

  sender   User   @relation(fields: [senderId], references: [id])
  senderId String @db.ObjectId
}
```

Each message has a `body` field for the content of the message, as well as an `image` field for any images that are sent. We also have a `seen` field that is a list of users that have seen the message. `seenIds` is a list of foreign keys that reference the `id` field in the `User` model.

We have a `conversation` field to reference which conversation the message belongs to. `conversationId` is a foreign key that references the `id` field in the `Conversation` model. We also have a `sender` field to reference which user sent the message. `senderId` is a foreign key that references the `id` field in the `User` model.

Now, we can run the following command to push our schema to MongoDB:

```bash
npx prisma db push
```

## NextAuth Setup

Start by installing the following dependencies:

```bash
npm i next-auth@latest @prisma/client @next-auth/prisma-adapter bcrypt
npm i -D @types/bcrypt
```

Create a prisma client in `app/libs/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client';

declare global {
	var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalThis.prisma = client;
}

export default client;
```

This allows us to interact with our database using Prisma.

Create an `api/auth/[...nextauth]/route.ts` file and import the following:

```ts
import bcrypt from 'bcrypt';
import NextAuth, { AuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/app/libs/prisma';
```

- `bcrypt` is used to hash passwords
- `Credentials` allow users to login with an email and password
- `GithubProvider` allow users to login with their Github
- `GoogleProvider` allows users to login with their Google accounts
- `PrismaAdapter` is used to connect NextAuth to Prisma
- `prisma` is the Prisma client we created to interact with the database.

From here, we need to create our `authOptions` object that will handle our authentication logic:

```ts
export const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		Credentials({
			name: 'credentials',
			credentials: {
				email: { label: 'email', type: 'text' },
				password: { label: 'password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error('Please enter your email and password');
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});

				if (!user || !user.hashedPassword) {
					throw new Error('Incorrect credentials');
				}

				const isCorrectPassword = await bcrypt.compare(
					credentials.password,
					user.hashedPassword
				);

				if (!isCorrectPassword) {
					throw new Error('Incorrect credentials');
				}

				return user;
			},
		}),
	],
	debug: process.env.NODE_ENV === 'development',
	session: {
		strategy: 'jwt',
	},
	secret: process.env.NEXTAUTH_SECRET,
};
```

It's long but it's not too complicated. Let's break it down:

- `adapter` uses the `PrismaAdapter` to connect NextAuth to Prisma
- `providers` is an array of providers that we want to use. We are using Github, Google, and Credentials.
- `debug` is set to `true` in development mode so that we can see more detailed logs
- `session` is set to use the `jwt` strategy. This means that we will be using JSON Web Tokens to store our session data.
- `secret` is used to sign our JWTs. This should be a long, random string.

In our `authorize()` function, we are checking if the user exists and if the password is correct. If everything checks out, we return the user.

Finally, we have to create the handler for our authentication options.

```ts
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

Make sure to add the following environment variables to your `.env` file:

```env
NEXTAUTH_SECRET=
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## API Routes

Create an `api/register/route.ts` file and add the following registration logic:

```ts
import bcrypt from 'bcrypt';
import prisma from '@/app/libs/prisma';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
	try {
		const { email, name, password } = (await request.json()) as Body;

		if (!email || !name || !password) {
			return new NextResponse('Missing parameters', { status: 400 });
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({
			data: {
				email,
				name,
				hashedPassword,
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		console.log(error, 'REGISTRATION_ERROR');
		return new NextResponse('Internal Server Error', { status: 500 });
	}
};
```

Nothing crazy. We are hashing the password and creating a new user in the database.

## Frontend API Requests

Start by installing the following dependencies:

```bash
npm i axios
```

Now, we can go back to our `AuthForm.tsx` file and implement the registration logic:

```tsx
const onSubmit: SubmitHandler<FieldValues> = data => {
  setIsLoading(true);

  if (variant === 'REGISTER') {
    axios
      .post('/api/register', data)
      .catch(() => toast.error('Something went wrong!'))
      .finally(() => setIsLoading(false));
  }

  if (variant === 'LOGIN') {
    signIn('credentials', {
      ...data,
      redirect: false,
    })
      .then(callback => {
        if (callback?.error) {
          toast.error(callback.error);
        }

        if (callback?.ok && !callback?.error) {
          toast.success('Logged in successfully!');
        }
      })
      .finally(() => setIsLoading(false));
  }
};
```

Here, we use `axios` to make a `POST` request to our `/api/register` route. If the request is successful, we register the user in the database. If the request fails, we display an error message using `react-hot-toast`.

If we're logging in, we use the `signIn()` function from NextAuth to login the user. If the login is successful, we display a success message. If the login fails, we display an error message.

Now, let's implement the login for Github and Google.

```tsx
const socialAction = (action: SocialAction) => {
  setIsLoading(true);

  signIn(action, { redirect: false })
    .then(callback => {
      if (callback?.error) {
        toast.error(callback.error);
      }

      if (callback?.ok && !callback?.error) {
        toast.success('Logged in successfully!');
      }
    })
    .finally(() => setIsLoading(false));
};
```

Here, we use the `signIn()` function from NextAuth to login the user. If the login is successful, we display a success message. If the login fails, we display an error message.

Make sure to add the required environment variables to the `.env` file. They can be acquired from the [Github Developer Settings](https://github.com/settings/developers) and the [Google Cloud Console](https://console.cloud.google.com/);

## Managing Sessions

Start by creating an `AuthContext.tsx` file and adding the following code:

```tsx
'use client';

import { SessionProvider } from 'next-auth/react';

interface AuthContextProps {
	children: React.ReactNode;
}

const AuthContext = ({ children }: AuthContextProps) => {
	return <SessionProvider>{children}</SessionProvider>;
};

export default AuthContext;
```

Wrap the application in the `AuthContext` component in the `layout.tsx` file:

```tsx
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<AuthContext>
					<ToasterContext />
					{children}
				</AuthContext>
			</body>
		</html>
	);
}
```

Now, in `AuthForm.tsx`, we can use the `useSession()` and `useRouter()` hooks to redirect the user to the dashboard if they are logged in:

```tsx
const session = useSession();
const router = useRouter();

useEffect(() => {
  if (session?.status === 'authenticated') {
    router.push('/users');
  }
}, [session?.status, router]);
```

## Protecting Routes

After we log in, we redirect the user to the dashboard. However, if the user is not logged in, they can still access the dashboard by typing in the URL. We need to protect the dashboard route so that only logged in users can access it.

Create a `middleware.ts` file in the root of the project and add the following code:

```ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
	pages: {
		signIn: '/',
	},
});

export const config = {
	matcher: ['/users/:path*'],
};
```

We specify that our sign in page is the root of the application. We also specify that we want to protect all routes that start with `/users`.

Note: There is currently a bug with `Next.js` version `13.4.4` where you'll get an error along the lines of `NextResponse has already been declared`. To fix this, you'll have to downgrade to `13.4.3`.

