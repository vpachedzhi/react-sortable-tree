import React, { Component } from 'react';
import SortableTree, { changeNodeAtPath } from '../../src';
import {dataConfig} from "../../src/utils/default-handlers"

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [
        { name: 'IT Manager' },
        {
          name: 'Regional Manager',
          expanded: true,
          children: [{ name: 'Branch Manager' }],
        },
      ],
    };
  }

  render() {
    const getNodeKey = ({ treeIndex }) => treeIndex;
    return (
      <div>
        <div style={{ height: 300 }}>
          <SortableTree
            treeData={this.state.treeData}
            onChange={treeData => this.setState({ treeData })}
            generateNodeProps={({ node, path }) => ({
              title: (
                <input
                  style={{ fontSize: '1.1rem' }}
                  value={node.name}
                  onChange={event => {
                    const name = event.target.value;

                    this.setState(state => ({
                      treeData: changeNodeAtPath({
                        treeData: state.treeData,
                        path,
                        getNodeKey,
                        newNode: { ...node, name },
                        dataConfig
                      }),
                    }));
                  }}
                />
              ),
            })}
          />
        </div>
      </div>
    );
  }
}
