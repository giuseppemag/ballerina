import { useState } from "react";
import "./App.css";
import { ParentTemplate2 } from "@ballerina/playground-core";
import { Parent } from "@ballerina/playground-core";
import { Uncle } from "@ballerina/playground-core";
import { UncleTemplate } from "@ballerina/playground-core";
import { AsyncState, OrderedMapRepo, unit } from "@ballerina/core";
import { UncleLayout } from "./domains/uncle/views/uncleLayout";
import { ParentLayout2 } from "./domains/parent/views/parentLayout2";
import { OrderedMap } from "immutable";
import { t } from "i18next";
import { DataSync } from "./domains/data-sync/state";
import { DataSyncTemplate } from "./domains/data-sync/template";
import { Range } from "immutable";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";
import { UserData } from "./domains/data-sync/domains/entities/domains/singletons/domains/user/state";
import { Address } from "./domains/data-sync/domains/entities/domains/collections/domains/address/state";
import { Invoice } from "./domains/data-sync/domains/entities/domains/collections/domains/invoice/state";
import { InvoiceLine } from "./domains/data-sync/domains/entities/domains/collections/domains/invoice/domains/invoice-line/state";

function App(props: {}) {
	const [parent, setParent] = useState(Parent.Default());
	const [uncle, setUncle] = useState(Uncle.Default());
	const uncleForeignMutations = Uncle.ForeignMutations({ context: uncle, setState: setUncle })
	const [dataSync, setDataSync] = useState(DataSync().Default(
		UserData.Default(v4(), faker.person.firstName(), faker.person.lastName()),
		OrderedMap(Range(0, 4).map(_ =>
			[`add-${_}`, Address.Default(`add-${_}`, faker.location.city(), faker.location.street(), faker.location.buildingNumber())]
		)),
		OrderedMap(Range(0, 4).map(_ =>
			[`inv-${_}`, Invoice.Default(`inv-${_}`,
				faker.animal.dog(),
				Range(0, 1 + (Math.floor(Math.random() * 4))).map(j =>
					InvoiceLine.Default(`invl-${_}${j}`, faker.vehicle.vehicle(), Math.floor(Math.random() * 90 + 10), Math.floor(Math.random() * 90 + 10))
				).toArray()
			)]
		)),
	));

	return (
		<div className="App">
			<h1>Ballerina 🩰</h1>
			<div className="card">
				<DataSyncTemplate
					context={{ ...dataSync }}
					setState={setDataSync}
					foreignMutations={unit}
					view={unit}
				/>
				<UncleTemplate
					context={uncle}
					setState={setUncle}
					foreignMutations={{}}
					view={UncleLayout}
				/>
				<ParentTemplate2
					context={parent}
					setState={setParent}
					foreignMutations={{
						setFlag: uncleForeignMutations.overrideFlag
					}}
					view={ParentLayout2}
				/>
			</div>
		</div>
	);
}

export default App;
