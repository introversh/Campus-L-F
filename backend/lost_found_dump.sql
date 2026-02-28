--
-- PostgreSQL database dump
--

\restrict TZIP0wQvWgvNrATldClKr4FjsCLF3sd9XkCcGaOILgxr6QdvQTmIWIDdmYPcZwO

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ClaimStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ClaimStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ClaimStatus" OWNER TO postgres;

--
-- Name: ItemStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ItemStatus" AS ENUM (
    'ACTIVE',
    'MATCHED',
    'CLAIMED',
    'CLOSED'
);


ALTER TYPE public."ItemStatus" OWNER TO postgres;

--
-- Name: ItemType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ItemType" AS ENUM (
    'LOST',
    'FOUND'
);


ALTER TYPE public."ItemType" OWNER TO postgres;

--
-- Name: MatchStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MatchStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED'
);


ALTER TYPE public."MatchStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'MATCH_FOUND',
    'CLAIM_SUBMITTED',
    'CLAIM_APPROVED',
    'CLAIM_REJECTED',
    'MESSAGE_RECEIVED',
    'ITEM_STATUS_UPDATE'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'STUDENT',
    'FACULTY',
    'ADMIN',
    'SECURITY'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: chat_room_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room_participants (
    id text NOT NULL,
    "chatRoomId" text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.chat_room_participants OWNER TO postgres;

--
-- Name: chat_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_rooms (
    id text NOT NULL,
    "matchId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.chat_rooms OWNER TO postgres;

--
-- Name: claims; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claims (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "matchId" text,
    "claimantId" text NOT NULL,
    description text NOT NULL,
    status public."ClaimStatus" DEFAULT 'PENDING'::public."ClaimStatus" NOT NULL,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.claims OWNER TO postgres;

--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    type public."ItemType" NOT NULL,
    status public."ItemStatus" DEFAULT 'ACTIVE'::public."ItemStatus" NOT NULL,
    location text NOT NULL,
    building text,
    floor text,
    "dateLostFound" timestamp(3) without time zone NOT NULL,
    "imageUrl" text,
    tags text[],
    "reporterId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id text NOT NULL,
    "lostItemId" text NOT NULL,
    "foundItemId" text NOT NULL,
    "confidenceScore" double precision NOT NULL,
    status public."MatchStatus" DEFAULT 'PENDING'::public."MatchStatus" NOT NULL,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.matches OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id text NOT NULL,
    "chatRoomId" text NOT NULL,
    "senderId" text NOT NULL,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    data jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    name text NOT NULL,
    role public."Role" DEFAULT 'STUDENT'::public."Role" NOT NULL,
    "studentId" text,
    phone text,
    department text,
    "avatarUrl" text,
    "refreshToken" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0e65ee3a-1f4a-4eab-8835-103dc0551dad	ee76816a2a86c5a151c37c76b5a66ff5892bb340f0c1631591c856f1ab7d15f9	2026-02-24 20:29:31.958969+05:30	20260224145931_init	\N	\N	2026-02-24 20:29:31.878101+05:30	1
\.


--
-- Data for Name: chat_room_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_room_participants (id, "chatRoomId", "userId") FROM stdin;
222d6a55-7d6e-4821-82d0-4447449dce3e	48f32601-f043-4650-b8b8-05b2bfe97ee1	5001c757-764c-4ea2-9f82-37ef293bd266
ac764925-0334-4056-84c8-2ba27643660d	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b
\.


--
-- Data for Name: chat_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_rooms (id, "matchId", "isActive", "createdAt", "updatedAt") FROM stdin;
48f32601-f043-4650-b8b8-05b2bfe97ee1	1b2c7218-87ea-4bb0-863b-d34d2346c758	t	2026-02-25 18:45:04.319	2026-02-25 18:45:04.319
\.


--
-- Data for Name: claims; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.claims (id, "itemId", "matchId", "claimantId", description, status, "adminNote", "createdAt", "updatedAt") FROM stdin;
eec05b39-1357-4c2b-8fcc-3f392711a03f	bb9efd30-430b-479d-821b-a57a26aac456	\N	5001c757-764c-4ea2-9f82-37ef293bd266	its mine	APPROVED	\N	2026-02-25 16:27:49.716	2026-02-25 16:29:29.587
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, title, description, category, type, status, location, building, floor, "dateLostFound", "imageUrl", tags, "reporterId", "createdAt", "updatedAt") FROM stdin;
2b037b72-6727-418c-9879-6a08f7265b38	ID	2023071070	Documents	LOST	MATCHED	Cafeteria	\N	\N	2026-02-24 20:21:00	\N	{id}	5001c757-764c-4ea2-9f82-37ef293bd266	2026-02-25 16:26:02.659	2026-02-25 16:27:02.199
bb9efd30-430b-479d-821b-a57a26aac456	ID	2023071070	Documents	FOUND	CLAIMED	Cafeteria	\N	\N	2026-02-24 21:26:00	\N	{id}	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	2026-02-25 16:27:02.115	2026-02-25 16:29:29.593
8313b03a-f8da-410b-b74c-dee4cac1d8c2	book	book	Electronics	LOST	MATCHED	Other	\N	\N	2026-02-09 16:56:00	\N	{}	5f980885-6072-4ca6-870d-73bb554b4d92	2026-02-25 16:56:13.368	2026-02-25 16:56:13.418
d06e41c9-626d-472a-a22f-44ac04ba6321	book	book	Books	FOUND	MATCHED	Library	\N	\N	2026-02-25 16:59:00	\N	{}	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	2026-02-25 16:55:31.648	2026-02-25 16:56:13.419
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matches (id, "lostItemId", "foundItemId", "confidenceScore", status, "adminNote", "createdAt", "updatedAt") FROM stdin;
1b2c7218-87ea-4bb0-863b-d34d2346c758	2b037b72-6727-418c-9879-6a08f7265b38	bb9efd30-430b-479d-821b-a57a26aac456	100	PENDING	\N	2026-02-25 16:27:02.167	2026-02-25 16:27:02.167
2e8cf101-9b63-459d-a24e-db3c0067c32e	8313b03a-f8da-410b-b74c-dee4cac1d8c2	d06e41c9-626d-472a-a22f-44ac04ba6321	40	CONFIRMED	\N	2026-02-25 16:56:13.401	2026-02-25 16:58:45.392
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, "chatRoomId", "senderId", content, "isRead", "createdAt") FROM stdin;
76d7b864-4d9f-46ee-957c-a4ee2d394162	48f32601-f043-4650-b8b8-05b2bfe97ee1	5001c757-764c-4ea2-9f82-37ef293bd266	hello	t	2026-02-25 18:45:16.576
e33e02f4-4076-4eed-92a0-4753926241c3	48f32601-f043-4650-b8b8-05b2bfe97ee1	5001c757-764c-4ea2-9f82-37ef293bd266	he	t	2026-02-25 18:45:22.927
21914ae7-431c-43bd-a53a-2e97f755571d	48f32601-f043-4650-b8b8-05b2bfe97ee1	5001c757-764c-4ea2-9f82-37ef293bd266	heloo	t	2026-02-25 18:54:02.425
19e860d8-90d3-47a8-855e-838c94fb54af	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hello	t	2026-02-26 09:23:13.552
23f65a16-a8bf-4120-8bd1-9f7f7476d3c4	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hello	t	2026-02-27 05:32:31.194
03808304-9d56-433c-83d5-a4ba269d9bf2	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hello	t	2026-02-27 05:32:52.127
a8afe46c-4387-42ea-97c3-4ea77e0dfe01	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hello	t	2026-02-27 05:44:53.823
419c8756-c4fb-48ea-861e-8bc06b594382	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hello	t	2026-02-27 06:01:24.381
af8f9db3-cf7f-4f3e-97df-f46ebcda7113	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	kbrfdkbv	t	2026-02-27 06:01:25.971
41f1e5ec-d16a-4953-9114-8bf87a415b24	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	kjdbgbfv	t	2026-02-27 06:01:26.841
280618f3-dcb9-4b9e-b6cb-c63b032c3d17	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	jbnzdijfvn	t	2026-02-27 06:01:27.647
e51efc07-d3e5-4ed0-af15-85b8798c7d63	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	kjbdgkfjvn	t	2026-02-27 06:01:28.466
00ed2f51-3a95-4b28-b4b6-b017934b0264	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	kjbsdkjbf	t	2026-02-27 06:01:29.282
7206a52d-1183-48fc-a804-8e6d4fdd7c9b	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	kjbdkfjnv	t	2026-02-27 06:01:30.134
ad48a2e5-37cf-4510-b1eb-bffc565bd9d5	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hello	t	2026-02-27 06:01:54.49
a1f95fa1-e286-4d2c-802e-791bc69da310	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	what	t	2026-02-27 06:01:56.829
453cc254-975d-4173-af10-4792a0c3dd88	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	i dont know	t	2026-02-27 06:02:00.651
33366a58-9df4-4f60-9f10-e5bc98c09364	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hello	t	2026-02-27 06:26:33.986
30fb194f-8d8e-480f-ae09-06ce958d289e	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hello	t	2026-02-27 06:26:36.458
e3b926ae-3c79-4a09-b86c-44e44b88d086	48f32601-f043-4650-b8b8-05b2bfe97ee1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	hi	t	2026-02-27 06:26:38.088
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", type, title, body, "isRead", data, "createdAt") FROM stdin;
d4eae6a9-b20e-4547-94d9-9eb62422f441	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	MATCH_FOUND	🎯 Potential Match Found!	Your found item "ID" may belong to someone who reported it lost.	f	{"matchId": "1b2c7218-87ea-4bb0-863b-d34d2346c758"}	2026-02-25 16:27:02.29
5d729e8e-bb50-4e90-bc98-e265f30ad7fe	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	CLAIM_SUBMITTED	📋 New Claim Submitted	Someone has claimed your item "ID". An admin will review shortly.	f	{"itemId": "bb9efd30-430b-479d-821b-a57a26aac456", "claimId": "eec05b39-1357-4c2b-8fcc-3f392711a03f"}	2026-02-25 16:27:49.731
f39f237f-c5a7-40f6-a6a3-c37970aac0e4	5f980885-6072-4ca6-870d-73bb554b4d92	MATCH_FOUND	🎯 Potential Match Found!	Your lost item "book" has a 40% match with a found item.	f	{"matchId": "2e8cf101-9b63-459d-a24e-db3c0067c32e"}	2026-02-25 16:56:13.517
7b4426cd-dcfb-42e4-bb11-4975eb8af2d1	a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	MATCH_FOUND	🎯 Potential Match Found!	Your found item "book" may belong to someone who reported it lost.	f	{"matchId": "2e8cf101-9b63-459d-a24e-db3c0067c32e"}	2026-02-25 16:56:13.518
0b117412-1255-4da0-8d78-3f33f0c70427	5001c757-764c-4ea2-9f82-37ef293bd266	CLAIM_APPROVED	✅ Claim Approved!	Your claim for "ID" has been approved. Please collect your item.	t	{"claimId": "eec05b39-1357-4c2b-8fcc-3f392711a03f"}	2026-02-25 16:29:29.6
8fa902af-2dd4-4a98-bce1-2126af993e61	5001c757-764c-4ea2-9f82-37ef293bd266	MATCH_FOUND	🎯 Potential Match Found!	Your lost item "ID" has a 100% match with a found item.	t	{"matchId": "1b2c7218-87ea-4bb0-863b-d34d2346c758"}	2026-02-25 16:27:02.289
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "passwordHash", name, role, "studentId", phone, department, "avatarUrl", "refreshToken", "createdAt", "updatedAt") FROM stdin;
a7226145-17ca-4d9d-aef2-2f8b3a6ba58b	introversh@gmail.com	$2b$12$OROJ/uVd9tlAE8YKllUH0OCFXhM8H156NKSXSuhswF/ElpXwUUM0q	Shivankar	ADMIN	001	+919569877801	IT	\N	$2b$12$Hzb7FmUoav4399W1TSsjmuWwMjha1mKMceB8uJ4TcbuayBpm8eLsi	2026-02-25 06:48:56.482	2026-02-28 07:30:33.58
5001c757-764c-4ea2-9f82-37ef293bd266	shivankarx@gmail.com	$2b$12$Eap3cC7iM7OfgthcDZA1f.wSXzQHxKXJTH..5iVVYoVLCckN8hLNm	Shiviee	STUDENT	002	+91 7525921536	CS	\N	$2b$12$vrwk2hAqxlEQIZMB3xr0Yu4Wa6ftBMJ0nqf.b421S1KNPH4Sqpzde	2026-02-25 16:18:42.105	2026-02-27 06:17:17.415
5f980885-6072-4ca6-870d-73bb554b4d92	dhritivika@gmail.com	$2b$12$FhkKISp5wxUWjDY6FotECO6D07x9uxsCmTYBZn6jLNfZErkZIyytS	Dhriti	SECURITY	003	100	Civil	\N	$2b$12$iGm2V2oJsIg/KoTwpWveIuIddxM9MFoUXnLzGKsuqXkXuZKXnWwHO	2026-02-25 16:29:12.006	2026-02-26 06:04:39.771
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: chat_room_participants chat_room_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_participants
    ADD CONSTRAINT chat_room_participants_pkey PRIMARY KEY (id);


--
-- Name: chat_rooms chat_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_pkey PRIMARY KEY (id);


--
-- Name: claims claims_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: chat_room_participants_chatRoomId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "chat_room_participants_chatRoomId_userId_key" ON public.chat_room_participants USING btree ("chatRoomId", "userId");


--
-- Name: chat_rooms_matchId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "chat_rooms_matchId_key" ON public.chat_rooms USING btree ("matchId");


--
-- Name: claims_claimantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "claims_claimantId_idx" ON public.claims USING btree ("claimantId");


--
-- Name: claims_itemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "claims_itemId_idx" ON public.claims USING btree ("itemId");


--
-- Name: claims_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX claims_status_idx ON public.claims USING btree (status);


--
-- Name: items_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX items_category_idx ON public.items USING btree (category);


--
-- Name: items_dateLostFound_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "items_dateLostFound_idx" ON public.items USING btree ("dateLostFound");


--
-- Name: items_location_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX items_location_idx ON public.items USING btree (location);


--
-- Name: items_reporterId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "items_reporterId_idx" ON public.items USING btree ("reporterId");


--
-- Name: items_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX items_status_idx ON public.items USING btree (status);


--
-- Name: items_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX items_type_idx ON public.items USING btree (type);


--
-- Name: matches_foundItemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "matches_foundItemId_idx" ON public.matches USING btree ("foundItemId");


--
-- Name: matches_lostItemId_foundItemId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "matches_lostItemId_foundItemId_key" ON public.matches USING btree ("lostItemId", "foundItemId");


--
-- Name: matches_lostItemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "matches_lostItemId_idx" ON public.matches USING btree ("lostItemId");


--
-- Name: matches_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX matches_status_idx ON public.matches USING btree (status);


--
-- Name: messages_chatRoomId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "messages_chatRoomId_idx" ON public.messages USING btree ("chatRoomId");


--
-- Name: messages_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "messages_isRead_idx" ON public.messages USING btree ("isRead");


--
-- Name: messages_senderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "messages_senderId_idx" ON public.messages USING btree ("senderId");


--
-- Name: notifications_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_isRead_idx" ON public.notifications USING btree ("isRead");


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_studentId_key" ON public.users USING btree ("studentId");


--
-- Name: chat_room_participants chat_room_participants_chatRoomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_participants
    ADD CONSTRAINT "chat_room_participants_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES public.chat_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_room_participants chat_room_participants_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_participants
    ADD CONSTRAINT "chat_room_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_rooms chat_rooms_matchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT "chat_rooms_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: claims claims_claimantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "claims_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: claims claims_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "claims_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: claims claims_matchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "claims_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: items items_reporterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "items_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: matches matches_foundItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT "matches_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: matches matches_lostItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT "matches_lostItemId_fkey" FOREIGN KEY ("lostItemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_chatRoomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES public.chat_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict TZIP0wQvWgvNrATldClKr4FjsCLF3sd9XkCcGaOILgxr6QdvQTmIWIDdmYPcZwO

